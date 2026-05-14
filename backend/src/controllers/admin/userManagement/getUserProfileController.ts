import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import GetUserProfileService from '../../../services/admin/userManagement/getUserProfileService';
import Responses from '../../../utils/responses';

class GetUserProfileController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;

      if (!normalizedUserId?.trim()) {
        return res
          .status(400)
          .json(Responses.errorResponse(new Error('User ID is required')));
      }

      const result = await GetUserProfileService.execute(normalizedUserId);

      return res
        .status(200)
        .json(Responses.successResponse('User profile retrieved', result));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default GetUserProfileController;
