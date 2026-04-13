import { Request, Response } from 'express';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import ClassService from '../services/classServices';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

class ClassController {
  static getStudentsByClassId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const classId = req.params.classId || req.body.classId;
    const page = Number.parseInt(String(req.query.page ?? '1'), 10);
    const limit = Number.parseInt(
      String(req.query.limit ?? MINIMUM_ITEMS_PER_PAGE),
      10
    );

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    try {
      const students = await ClassService.getStudentsByClassId(
        classId,
        Number.isNaN(page) ? 1 : page,
        Number.isNaN(limit) ? MINIMUM_ITEMS_PER_PAGE : limit
      );
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
