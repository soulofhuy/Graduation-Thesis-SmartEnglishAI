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

    return prisma.profile.update({
      where: { userId },
      data: {
        ...profileData
      }
    });
  };
}

export default ProfileService;
