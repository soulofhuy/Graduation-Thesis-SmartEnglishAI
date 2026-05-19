import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import GetListOfResultsServices from '../../../services/admin/resultManagement/getListOfResultsServices';

class GetListOfResultsController {
  static getClassProgressOnAssignments = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const adminId = req.userId;
    const classId = req.params.classId || req.body.classId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!adminId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!classId || !assignmentId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error('Class ID and Assignment ID are required')
          )
        );
    }

    try {
      const progress =
        await GetListOfResultsServices.getClassProgressOnAssignments(
          adminId,
          classId,
          assignmentId
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Class progress fetched successfully',
            progress
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default GetListOfResultsController;
