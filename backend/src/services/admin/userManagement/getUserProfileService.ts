import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';

class GetUserProfileService {
  static execute = async (userId: string) => {
    if (!userId?.trim()) throw new Error('User ID is required');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        deactivatedAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            address: true,
            phoneNumber: true,
            dateOfBirth: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!user) throw new Error('User not found');

    if (user.role === Role.ADMIN) {
      throw new Error('Cannot access ADMIN profile via this endpoint');
    }

    return user;
  };
}

export default GetUserProfileService;
