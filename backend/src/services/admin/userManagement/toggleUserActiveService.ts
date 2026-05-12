import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';

class ToggleUserActiveService {
  static execute = async (userId: string) => {
    if (!userId?.trim()) throw new Error('User ID is required');

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true, email: true }
    });

    if (!existing) throw new Error('User not found');
    if (existing.role === Role.ADMIN)
      throw new Error('Cannot toggle ADMIN account');

    const now = new Date();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !existing.isActive,
        deactivatedAt: existing.isActive ? now : null
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        deactivatedAt: true
      }
    });

    return updated;
  };
}

export default ToggleUserActiveService;
