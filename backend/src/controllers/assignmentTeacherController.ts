import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import AssignmentService from '../services/assignmentTeacherServices';
import Responses from '../utils/responses';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

class AssignmentController {
  static createAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const creatorId = req.userId;

    if (!creatorId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const createdAssignment =
        await AssignmentService.createAssignmentWithTasks(creatorId, req.body);

      return res
        .status(201)
        .json(
          Responses.successResponse(
            'Assignment created successfully',
            createdAssignment
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAssignmentById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const assignment =
        await AssignmentService.getAssignmentById(assignmentId);

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

  static getChatMessagesByAssignmentId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;
    const studentId = req.query.studentId;
    const latest = Number(req.query.latest ?? 3);

    if (!teacherId) {
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
      const chatMessages =
        await AssignmentService.getChatMessagesByAssignmentId(
          teacherId,
          assignmentId,
          typeof studentId === 'string' ? studentId : undefined,
          latest
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment chat messages fetched successfully',
            chatMessages
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAssignmentsByClassId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const classId = req.params.classId || req.body.classId;

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const assignments =
        await AssignmentService.getAssignmentsByClassId(classId);
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignments fetched successfully',
            assignments
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getOlderChatMessagesBySessionId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const sessionId = req.params.sessionId || req.body.sessionId;
    const before = req.query.before as string | undefined;
    const limit = Number(req.query.limit ?? 20);

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!sessionId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Session ID is required')));
    }

    try {
      const messages = await AssignmentService.getOlderPromptsBySessionId(
        teacherId,
        sessionId,
        before,
        limit
      );

      return res
        .status(200)
        .json(Responses.successResponse('Older prompts fetched', messages));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getAssignmentsCreatedByTeacher = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? MINIMUM_ITEMS_PER_PAGE);

    if (!teacherId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const assignments =
        await AssignmentService.getAssignmentsCreatedByTeacher(
          teacherId,
          page,
          limit
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Teacher assignments fetched successfully',
            assignments
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static updateAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const updaterId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!updaterId) {
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
      // Supports both basic fields and full payload with tasks
      const updatedAssignment = await AssignmentService.updateAssignment(
        updaterId,
        assignmentId,
        req.body
      );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment updated successfully',
            updatedAssignment
          )
        );
    } catch (error: any) {
      if (error?.code === 'ASSESSMENT_HAS_ATTEMPTS') {
        return res.status(409).json({
          status: false,
          message: error.message,
          data: null,
          error: { code: 'ASSESSMENT_HAS_ATTEMPTS' }
        });
      }
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static updateAssignmentFull = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const updaterId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!updaterId) {
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
      // Full assignment update with tasks
      const updatedAssignment =
        await AssignmentService.updateAssignmentWithTasks(
          updaterId,
          assignmentId,
          req.body
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment updated successfully',
            updatedAssignment
          )
        );
    } catch (error: any) {
      if (error?.code === 'ASSESSMENT_HAS_ATTEMPTS') {
        return res.status(409).json({
          status: false,
          message: error.message,
          data: null,
          error: { code: 'ASSESSMENT_HAS_ATTEMPTS' }
        });
      }
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static toggleAssignmentActiveStatus = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!teacherId) {
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
      const updatedAssignment =
        await AssignmentService.toggleAssignmentActiveStatus(assignmentId);
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment active status toggled successfully',
            updatedAssignment
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static deleteAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const teacherId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

    if (!teacherId) {
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
      await AssignmentService.deleteAssignment(assignmentId);
      return res
        .status(200)
        .json(
          Responses.successResponse('Assignment deleted successfully', null)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getDeactivatedAssignmentsByTeacher = async (
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
      const assignments =
        await AssignmentService.getAllDeactivatedAssignmentsByTeacherId(
          teacherId
        );
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Deactivated assignments retrieved successfully',
            assignments
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AssignmentController;
