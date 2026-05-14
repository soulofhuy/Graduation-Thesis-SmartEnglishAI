import prisma from '../../../utils/prisma';
import { Role } from '../../../generated/prisma/enums';

type ProfilePayload = {
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null; // ISO string expected
};

class UpdateUserProfileService {
  static execute = async (userId: string, payload: ProfilePayload) => {
    if (!userId?.trim()) throw new Error('User ID is required');

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!existingUser) throw new Error('User not found');

    if (existingUser.role === Role.ADMIN) {
      throw new Error('Cannot update ADMIN profile via this endpoint');
    }

    const data: any = {};

    if (payload.firstName !== undefined) data.firstName = payload.firstName;
    if (payload.lastName !== undefined) data.lastName = payload.lastName;
    if (payload.address !== undefined) data.address = payload.address;
    if (payload.phoneNumber !== undefined)
      data.phoneNumber = payload.phoneNumber;
    if (payload.dateOfBirth !== undefined) {
      data.dateOfBirth = payload.dateOfBirth
        ? new Date(payload.dateOfBirth)
        : null;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: data,
            update: data
          }
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
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

    return updated;
  };
}

export default UpdateUserProfileService;
