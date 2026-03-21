import prisma from '../utils/prisma';

export type UpdateProfileInput = {
  firstName?: string | null;
  lastName?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | string | null;
};

class ProfileService {
  constructor(private readonly db = prisma) {}

  getProfileByUserId = async (userId: string) => {
    return this.db.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });
  };

  updateProfile = async (userId: string, payload: UpdateProfileInput) => {
    const existingProfile = await this.db.profile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    const allowedFields: Array<keyof UpdateProfileInput> = [
      'firstName',
      'lastName',
      'address',
      'phoneNumber',
      'dateOfBirth'
    ];

    const data = allowedFields.reduce<Record<string, unknown>>((acc, key) => {
      const value = payload[key];
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(data).length === 0) {
      throw new Error('No profile fields provided to update');
    }

    return this.db.profile.update({
      where: { userId },
      data
    });
  };
}

const profileService = new ProfileService();

export default profileService;
