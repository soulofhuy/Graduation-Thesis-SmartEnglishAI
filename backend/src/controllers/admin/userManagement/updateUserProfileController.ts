import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import UpdateUserProfileService from '../../../services/admin/userManagement/updateUserProfileService';
import Responses from '../../../utils/responses';

class UpdateUserProfileController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;
      const payload = req.body || {};

      if (!normalizedUserId?.trim()) {
        return res
          .status(400)
          .json(Responses.errorResponse(new Error('User ID is required')));
      }

      const result = await UpdateUserProfileService.execute(
        normalizedUserId,
        payload
      );

      return res
        .status(200)
        .json(Responses.successResponse('User profile updated', result));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default UpdateUserProfileController;
