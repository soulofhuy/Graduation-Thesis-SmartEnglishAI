import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import Responses from '../../utils/responses';
import { getTeacherOverview } from '../../services/teacher/viewOverviewStatisticServices';

class ViewOverviewStatisticController {
  static getTeacherOverview = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const overview = await getTeacherOverview(teacherId);

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Teacher overview fetched successfully',
            overview
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ViewOverviewStatisticController;
