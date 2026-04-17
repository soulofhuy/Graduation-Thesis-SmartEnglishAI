import { Request, Response } from 'express';
import Responses from '../utils/responses';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import StudentService from '../services/studentServices';
import { MINIMUM_ITEMS_PER_PAGE } from '../utils/constants';

class StudentController {
  static getBannedStudentsByClassId = async (
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
      const students = await StudentService.getBannedStudentsByClassId(
        classId,
        Number.isNaN(page) ? 1 : page,
        Number.isNaN(limit) ? MINIMUM_ITEMS_PER_PAGE : limit
      );
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Banned students fetched successfully',
            students
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static toggleBanStudent = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const classId = req.params.classId || req.body.classId;
    const studentId = req.params.studentId || req.body.studentId;

    if (!classId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Class ID is required')));
    }

    if (!studentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Student ID is required')));
    }

    try {
      const updatedMember = await StudentService.toggleBanStudentInClass(
        classId,
        studentId
      );
      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student ban status updated successfully',
            updatedMember
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default StudentController;
