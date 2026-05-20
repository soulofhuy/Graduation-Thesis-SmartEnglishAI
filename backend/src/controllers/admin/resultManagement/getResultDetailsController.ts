import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import GetResultDetailsServices from '../../../services/admin/resultManagement/getResultDetailsServices';

class GetResultDetailsController {
  static getStudentAssignmentProgressDetail = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const adminId = req.userId;
    const studentId = req.params.studentId || req.body.studentId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!adminId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!studentId || !assignmentId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error('Student ID and Assignment ID are required')
          )
        );
    }

    try {
      const detail =
        await GetResultDetailsServices.getStudentAssignmentProgressDetail(
          adminId,
          assignmentId,
          studentId
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student assignment progress detail fetched successfully',
            detail
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default GetResultDetailsController;
