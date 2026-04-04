import { Request, Response } from 'express';
import ClassStudentService from '../services/classStudentServices';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class ClassStudentController {
  static getAllPendingRequestsToJoinClassByStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;
    if (!studentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Student ID is required')));
    }

    try {
      const pendingRequests =
        await ClassStudentService.getAllPendingRequestsToJoinClassByStudent(
          studentId
        );
      return res.json(
        Responses.successResponse(
          'Pending requests retrieved successfully',
          pendingRequests
        )
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static studentJoinClass = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const { classCode } = req.body;
    const studentId = req.userId;

    if (!classCode) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class code is required')));
    }

    if (!studentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Student ID is required')));
    }

    try {
      const result = await ClassStudentService.studentJoinClass(
        classCode,
        studentId
      );
      return res.json(
        Responses.successResponse('Student joined class successfully', result)
      );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ClassStudentController;
