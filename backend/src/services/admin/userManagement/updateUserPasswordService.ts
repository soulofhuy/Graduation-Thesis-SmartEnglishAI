import bcrypt from 'bcrypt';
import { Role } from '../../../generated/prisma/enums';
import prisma from '../../../utils/prisma';

class UpdateUserPasswordService {
  static execute = async (userId: string, newPassword: string) => {
    if (!userId?.trim()) {
      throw new Error('User ID is required');
    }

    if (!newPassword?.trim()) {
      throw new Error('New password is required');
    }

    if (newPassword.trim().length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        email: true,
        isActive: true
      }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.role === Role.ADMIN) {
      throw new Error('Cannot update password for ADMIN account');
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    return {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      isActive: existingUser.isActive
    };
  };
}

export default UpdateUserPasswordService;
