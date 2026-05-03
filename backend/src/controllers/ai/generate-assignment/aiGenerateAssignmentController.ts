import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import AIGenerateAssignmentServices from '@/services/ai/generate-assignment/aiGenerateAssignmentServices';

class AIGenerateAssignmentController {
  static generateAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const topic = req.body?.topic;

    if (!topic) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Topic is required')));
    }

    try {
      const assignment =
        await AIGenerateAssignmentServices.generateAssignment(topic);

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Assignment generated successfully',
            assignment
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(
          Responses.errorResponse(new Error('Failed to generate assignment'))
        );
    }
  };
}

export default AIGenerateAssignmentController;
