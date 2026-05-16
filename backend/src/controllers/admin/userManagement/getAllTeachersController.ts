import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import GetAllTeachersService from '../../../services/admin/userManagement/getAllTeachersService';
import Responses from '../../../utils/responses';

class GetAllTeachersController {
  static handle = async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const teachers = await GetAllTeachersService.execute();

      return res
        .status(200)
        .json(
          Responses.successResponse('Teachers retrieved successfully', teachers)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default GetAllTeachersController;
