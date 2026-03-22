import { Response } from 'express';
import ProfileService from '../services/profileServices';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import Responses from '../utils/responses';

class ProfileController {
  static getMyProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res
          .status(401)
          .json(Responses.errorResponse(new Error('Unauthorized')));
      }

      const profile = await ProfileService.getProfileByUserId(userId);

      if (!profile) {
        return res
          .status(404)
          .json(Responses.errorResponse(new Error('Profile not found')));
      }

      return res
        .status(200)
        .json(
          Responses.successResponse('Profile fetched successfully', profile)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static updateMyProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const profileData = req.body;

      if (!userId) {
        return res
          .status(401)
          .json(Responses.errorResponse(new Error('Unauthorized')));
      }

      const updatedProfile = await ProfileService.updateProfile(
        userId,
        profileData
      );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Profile updated successfully',
            updatedProfile
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ProfileController;
