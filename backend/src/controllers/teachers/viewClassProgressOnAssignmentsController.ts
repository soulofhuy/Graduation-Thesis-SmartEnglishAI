import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import Responses from '../../utils/responses';
import ViewClassProgressOnAssignmentsService from '../../services/teacher/viewClassProgressOnAssignmentsServices';

class ViewClassProgressOnAssignmentsController {
  static getClassProgressOnAssignments = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const classId = req.params.classId || req.body.classId;

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const progress =
        await ViewClassProgressOnAssignmentsService.getClassProgressOnAssignments(
          teacherId,
          classId
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

  static getStudentAssignmentProgressDetail = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const classId = req.params.classId || req.body.classId;
    const studentId = req.params.studentId || req.body.studentId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!classId || !studentId || !assignmentId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(
            new Error('Class ID, Student ID, and Assignment ID are required')
          )
        );
    }

    try {
      const detail =
        await ViewClassProgressOnAssignmentsService.getStudentAssignmentProgressDetail(
          teacherId,
          classId,
          studentId,
          assignmentId
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

export default ViewClassProgressOnAssignmentsController;
