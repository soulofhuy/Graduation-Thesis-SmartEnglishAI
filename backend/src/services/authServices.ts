import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { signToken } from '../utils/jwt';
import { Role } from '../generated/prisma/enums';

class AuthService {
  static registerUser = async (email: string, password: string, role: Role) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async tx => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role
        }
      });

      await tx.profile.create({
        data: {
          userId: createdUser.id
        }
      });

      return createdUser;
    });

    return user;
  };

  static loginUser = async (email: string, password: string) => {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email');
    }
    if (!user.isActive) {
      throw new Error('User account is inactive');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const token = signToken(user.id);
    return { user, token };
  };

  static changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  };

  static deactivateUser = async (userId: string) => {
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false, deactivatedAt: new Date() }
    });
  };

  static findUserById = async (id: string) => {
    return prisma.user.findUnique({
      where: { id }
    });
  };

  static findUserByEmail = async (email: string) => {
    return prisma.user.findUnique({
      where: { email }
    });
  };
}

export default AuthService;
