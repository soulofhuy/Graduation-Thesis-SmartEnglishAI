import { Response } from 'express';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import ViewStudyProgressService from '../../services/students/viewStudyProgressServices';
import Responses from '../../utils/responses';

class ViewStudyProgressController {
  static getStudyProgress = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const studentId = req.userId;

    if (!studentId) {
      return res
        .status(401)
        .json(
          Responses.errorResponse(new Error('Unauthorized - User ID not found'))
        );
    }

    try {
      const studyProgress =
        await ViewStudyProgressService.getStudyProgress(studentId);

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Student study progress fetched successfully',
            studyProgress
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default ViewStudyProgressController;
