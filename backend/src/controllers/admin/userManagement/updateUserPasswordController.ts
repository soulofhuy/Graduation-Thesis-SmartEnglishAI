import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import UpdateUserPasswordService from '../../../services/admin/userManagement/updateUserPasswordService';
import Responses from '../../../utils/responses';

class UpdateUserPasswordController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;
      const normalizedUserId = Array.isArray(userId) ? userId[0] : userId;

      if (!normalizedUserId?.trim() || !newPassword) {
        return res
          .status(400)
          .json(
            Responses.errorResponse(
              new Error('User ID and new password are required')
            )
          );
      }

      const result = await UpdateUserPasswordService.execute(
        normalizedUserId,
        String(newPassword)
      );

      return res
        .status(200)
        .json(
          Responses.successResponse('Password updated successfully', result)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default UpdateUserPasswordController;
