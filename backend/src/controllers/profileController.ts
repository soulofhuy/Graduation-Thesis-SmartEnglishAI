import { Response } from 'express';
import ProfileService from '../services/profileServices';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class ProfileController {
  static getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const profile = await ProfileService.getProfileByUserId(userId);

      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      return res
        .status(200)
        .json({ message: 'Profile fetched successfully', profile });
    } catch (error) {
      return res.status(400).json({ message: 'Get profile failed', error });
    }
  };
}

export default ProfileController;
