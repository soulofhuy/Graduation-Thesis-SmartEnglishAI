import { Request, Response } from 'express';
import { requestOTPService, verifyOTPService, resetPasswordService } from '../services/forgotPasswordServices';
import responses from '../utils/responses';

export const requestPasswordReset = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json(responses.errorResponse(new Error("Email is required")));
        }

        await requestOTPService(email);
        res.status(200).json(responses.successResponse("If the email is registered, an OTP has been sent."));
    } catch (error: any) {
        res.status(500).json(responses.errorResponse(error));
    }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json(responses.errorResponse(new Error("Email and OTP are required")));
        }

        const isValid = await verifyOTPService(email, otp);
        if (!isValid) {
            return res.status(400).json(responses.errorResponse(new Error("Invalid or expired OTP")));
        }

        res.status(200).json(responses.successResponse("OTP is valid"));
    } catch (error: any) {
        res.status(500).json(responses.errorResponse(error));
    }
};

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { email, newPassword } =
            req.body;

        if (!email || !newPassword) {
            return res
                .status(400)
                .json(
                    responses.errorResponse(
                        new Error(
                            "Email and newPassword are required"
                        )
                    )
                );
        }

        await resetPasswordService(
            email,
            newPassword
        );

        return res
            .status(200)
            .json(
                responses.successResponse(
                    "Password updated successfully"
                )
            );
    } catch (error: any) {
        return res
            .status(400)
            .json(
                responses.errorResponse(error)
            );
    }
};