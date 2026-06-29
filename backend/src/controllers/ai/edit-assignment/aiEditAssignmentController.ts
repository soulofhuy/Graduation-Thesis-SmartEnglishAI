import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import AIEditAssignmentServices from '@/services/ai/edit-assignment/aiEditAssignmentServices';
import AIChatSessionServices from '@/services/ai/chat-session/aiChatSessionServices';
import { AIPromptType } from '@/generated/prisma/client';

class AIEditAssignmentController {
  static editAssignment = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { message, currentAssignment, conversationHistory, assignmentId, chatSessionId, chatSessionTitle } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json(Responses.errorResponse(new Error('message is required')));
    }

    if (!currentAssignment || typeof currentAssignment !== 'object') {
      return res.status(400).json(Responses.errorResponse(new Error('currentAssignment is required and must be an object')));
    }

    try {
      const result = await AIEditAssignmentServices.editAssignmentContent(
        currentAssignment,
        message.trim(),
        Array.isArray(conversationHistory) ? conversationHistory : []
      );

      let chatSession = null;

      if (userId && (assignmentId || chatSessionId)) {
        const chatResult = await AIChatSessionServices.recordPromptAndResponse({
          userId,
          prompt: message.trim(),
          ...(assignmentId ? { assignmentId } : {}),
          ...(chatSessionId ? { chatSessionId } : {}),
          ...(chatSessionTitle ? { chatSessionTitle } : {}),
          type: AIPromptType.ASSIGMMENT_CREATION,
          rawText: result.rawText
        });
        chatSession = chatResult.chatSession;
      }

      return res.status(200).json(
        Responses.successResponse('Assignment edited successfully', {
          assignment: result.assignment,
          explanation: result.explanation,
          chatSession
        })
      );
    } catch (error) {
      console.error('Error editing assignment with AI:', error);
      return res.status(500).json(Responses.errorResponse(new Error('Failed to edit assignment with AI')));
    }
  };
}

export default AIEditAssignmentController;
