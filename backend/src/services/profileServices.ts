import prisma from '../utils/prisma';
import { ProfileModel } from '../generated/prisma/models/Profile';

class ProfileService {
  static getProfileByUserId = async (userId: string) => {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });
  };

  static updateProfile = async (
    userId: string,
    profileData: Partial<ProfileModel>
  ) => {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!existingProfile) {
      throw new Error('Profile not found');
    }

    const { createdAt, updatedAt, ...rest } = profileData;
    const dateOfBirthValue = (profileData as { dateOfBirth?: unknown })
      .dateOfBirth;
    const parsedDateOfBirth =
      typeof dateOfBirthValue === 'string' && dateOfBirthValue.trim().length > 0
        ? new Date(`${dateOfBirthValue}T00:00:00.000Z`)
        : dateOfBirthValue instanceof Date
          ? dateOfBirthValue
          : undefined;

    return prisma.profile.update({
      where: { userId },
      data: {
        ...rest,
        ...(parsedDateOfBirth ? { dateOfBirth: parsedDateOfBirth } : {})
      }
    });
  };
}

export default ProfileService;
