import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import AssignmentService from '../../../services/assignmentTeacherServices';
import Responses from '../../../utils/responses';

class DeleteAssignmentController {
  static handle = async (req: AuthenticatedRequest, res: Response) => {
    const assignmentId = req.params.assignmentId || req.body.assignmentId;

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
}

export default DeleteAssignmentController;
