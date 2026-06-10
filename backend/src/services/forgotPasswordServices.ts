import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import prisma from "@/utils/prisma";
import { redis } from "@/utils/redis";

const OTP_EXPIRE_SECONDS = 5 * 60;
const MAX_OTP_ATTEMPTS = 5;

interface OTPRecord {
    hashedOtp: string;
    attempts: number;
    verified: boolean;
}

const getResetPasswordKey = (email: string) =>
    `reset-password:${email}`;

export const sendEmailService = async (
    recipientEmail: string,
    otp: string
) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MY_EMAIL,
            pass: process.env.MY_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.MY_EMAIL,
        to: recipientEmail,
        subject: "Password Recovery OTP",
        html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Password Recovery</h2>

        <p>
          Use the OTP below to reset your password.
        </p>

        <h1>${otp}</h1>

        <p>
          This OTP will expire in 5 minutes.
        </p>

        <p>
          If you did not request a password reset,
          please ignore this email.
        </p>
      </div>
    `,
    });
};

export const requestOTPService = async (
    email: string
): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        return;
    }

    const otp = Math.floor(
        100000 + Math.random() * 900000
    ).toString();

    const hashedOtp = await bcrypt.hash(otp, 10);

    const payload: OTPRecord = {
        hashedOtp,
        attempts: 0,
        verified: false,
    };

    await redis.set(
        getResetPasswordKey(email),
        JSON.stringify(payload),
        {
            EX: OTP_EXPIRE_SECONDS,
        }
    );

    try {
        await sendEmailService(email, otp);
    } catch (error) {
        await redis.del(
            getResetPasswordKey(email)
        );

        throw error;
    }
};

export const verifyOTPService = async (
    email: string,
    otp: string
): Promise<boolean> => {
    const raw = await redis.get(
        getResetPasswordKey(email)
    );

    if (!raw) {
        return false;
    }

    const record: OTPRecord = JSON.parse(raw);

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
        await redis.del(
            getResetPasswordKey(email)
        );

        return false;
    }

    const isValid = await bcrypt.compare(
        otp,
        record.hashedOtp
    );

    if (!isValid) {
        record.attempts += 1;

        await redis.set(
            getResetPasswordKey(email),
            JSON.stringify(record),
            {
                KEEPTTL: true,
            }
        );

        return false;
    }

    record.verified = true;

    await redis.set(
        getResetPasswordKey(email),
        JSON.stringify(record),
        {
            KEEPTTL: true,
        }
    );

    return true;
};

export const resetPasswordService = async (
    email: string,
    newPassword: string
): Promise<void> => {
    const raw = await redis.get(
        getResetPasswordKey(email)
    );

    if (!raw) {
        throw new Error(
            "OTP verification required"
        );
    }

    const record: OTPRecord = JSON.parse(raw);

    if (!record.verified) {
        throw new Error(
            "OTP has not been verified"
        );
    }

    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (newPassword.length < 8) {
        throw new Error(
            "Password must be at least 8 characters"
        );
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await prisma.user.update({
        where: {
            email,
        },
        data: {
            password: hashedPassword,
        },
    });

    await redis.del(
        getResetPasswordKey(email)
    );
};