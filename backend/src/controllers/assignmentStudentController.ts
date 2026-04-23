import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import AssignmentStudentService from '../services/assignmentStudentServices';
import Responses from '../utils/responses';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

class AssignmentStudentController {
  static getAssignmentsAssignedToStudentClasses = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? MINIMUM_ITEMS_PER_PAGE);

    if (!studentId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const assignments =
        await AssignmentStudentService.getAssignmentsAssignedToStudentClasses(
          studentId,
          page,
          limit
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student assignments fetched successfully',
            assignments
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAssignmentByIdForStudentToDoTest = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const assignmentId =
      req.params.assignmentId || req.params.id || req.body?.assignmentId;

    if (!assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const assignment =
        await AssignmentStudentService.getAssignmentByIdForStudentToDoTest(
          assignmentId
        );

      if (!assignment) {
        return res
          .status(404)
          .json(Responses.errorResponse(new Error('Assignment not found')));
      }

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment fetched successfully',
            assignment
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAssignmentsHistoryOfStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? MINIMUM_ITEMS_PER_PAGE);

    if (!studentId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const assignments =
        await AssignmentStudentService.getAssignmentsHistoryOfStudent(
          studentId,
          page,
          limit
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student assignments history fetched successfully',
            assignments
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getFullAttemptHistoryOfStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    const assignmentId =
      req.params.assignmentId ||
      req.query.assignmentId ||
      req.body.assignmentId;

    if (!studentId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const history =
        await AssignmentStudentService.getFullAttemptHistoryOfStudent(
          studentId,
          String(assignmentId)
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student full attempt history fetched successfully',
            history
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AssignmentStudentController;
