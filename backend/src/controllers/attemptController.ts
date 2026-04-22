import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import AttemptService from '../services/attemptServices';
import Responses from '../utils/responses';

class AttemptController {
  static getLatestAttemptForStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

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
      const attempt = await AttemptService.getLatestAttemptForStudent(
        studentId,
        assignmentId
      );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Latest attempt fetched successfully',
            attempt
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static startOrGetInProgressAttempt = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    const assignmentId = req.body.assignmentId || req.params.assignmentId;

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
      const attempt = await AttemptService.startOrGetInProgressAttempt(
        studentId,
        assignmentId
      );

      return res
        .status(200)
        .json(Responses.successResponse('Attempt is ready', attempt));
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static submitAttempt = async (req: AuthenticatedRequest, res: Response) => {
    const studentId = req.userId;

    if (!studentId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    if (!req.body?.assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const submittedAttempt = await AttemptService.submitAttempt(studentId, {
        assignmentId: req.body.assignmentId,
        draftAnswer: req.body.draftAnswer,
        answers: req.body.answers
      });

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Attempt submitted successfully',
            submittedAttempt
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AttemptController;
