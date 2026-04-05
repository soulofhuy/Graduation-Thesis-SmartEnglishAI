import { Request, Response } from 'express';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import ClassService from '../services/class';

class ClassController {
  static getStudentsByClassId = async (
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
      const students = await ClassService.getStudentsByClassId(classId);
      return res
        .status(200)
        .json(
          Responses.successResponse('Students fetched successfully', students)
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ClassController;
