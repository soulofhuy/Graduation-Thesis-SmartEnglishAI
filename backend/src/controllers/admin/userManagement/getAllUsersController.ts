import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import GetAllUsersService from '../../../services/admin/userManagement/getAllUsersService';
import Responses from '../../../utils/responses';

class GetAllUsersController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 10;

      if (!Number.isInteger(page) || page < 1) {
        return res
          .status(400)
          .json(
            Responses.errorResponse(
              new Error('Page must be a positive integer')
            )
          );
      }

      if (!Number.isInteger(limit) || limit < 1) {
        return res
          .status(400)
          .json(
            Responses.errorResponse(
              new Error('Limit must be a positive integer')
            )
          );
      }

      const result = await GetAllUsersService.execute({
        page,
        limit
      });

      return res
        .status(200)
        .json(
          Responses.successResponse('Users retrieved successfully', result)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default GetAllUsersController;
