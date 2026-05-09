import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import AIGenerateAssignmentServices from '@/services/ai/generate-assignment/aiGenerateAssignmentServices';
import AIChatSessionServices from '@/services/ai/chat-session/aiChatSessionServices';
import { AIPromptType } from '@/generated/prisma/client';

class AIGenerateAssignmentController {
  static generateAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.userId;
    const topic = req.body?.topic;
    const assignmentId = req.body?.assignmentId;
    const chatSessionId = req.body?.chatSessionId;
    const chatSessionTitle = req.body?.chatSessionTitle;

    if (!topic) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Topic is required')));
    }

    try {
      const assignmentResult =
        await AIGenerateAssignmentServices.generateAssignmentContent(topic);

      const assignment = assignmentResult.assignment;

      let chatSession = null;

      if (userId && (assignmentId || chatSessionId)) {
        const chatResult = await AIChatSessionServices.recordPromptAndResponse({
          userId,
          prompt: topic,
          ...(assignmentId ? { assignmentId } : {}),
          ...(chatSessionId ? { chatSessionId } : {}),
          ...(chatSessionTitle ? { chatSessionTitle } : {}),
          type: AIPromptType.ASSIGMMENT_CREATION,
          rawText: assignmentResult.rawText
        });

        chatSession = chatResult.chatSession;
      }

      return res.status(200).json(
        Responses.successResponse('Assignment generated successfully', {
          assignment,
          chatSession
        })
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
