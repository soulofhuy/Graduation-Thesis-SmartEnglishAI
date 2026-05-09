import { Response } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import Responses from '../../../utils/responses';
import AIChatSessionServices from '@/services/ai/chat-session/aiChatSessionServices';
import { AIPromptType } from '@/generated/prisma/client';

const normalizeStringInput = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
};

const normalizePromptType = (value: unknown): AIPromptType | undefined => {
  const rawType = normalizeStringInput(value);

  if (!rawType) {
    return undefined;
  }

  if (rawType === AIPromptType.ASSIGMMENT_CREATION) {
    return AIPromptType.ASSIGMMENT_CREATION;
  }

  if (rawType === AIPromptType.RESULT_ANALYSIS) {
    return AIPromptType.RESULT_ANALYSIS;
  }

  return undefined;
};

class AIChatSessionController {
  static sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const prompt = normalizeStringInput(req.body?.prompt);
    const assignmentTitle = normalizeStringInput(req.body?.assignmentTitle);
    const assignmentDescription = normalizeStringInput(
      req.body?.assignmentDescription
    );
    const classId = normalizeStringInput(req.body?.classId);
    const dueDate = normalizeStringInput(req.body?.dueDate);
    const isPublic =
      typeof req.body?.isPublic === 'boolean' ? req.body.isPublic : undefined;
    const isSingleAttempt =
      typeof req.body?.isSingleAttempt === 'boolean'
        ? req.body.isSingleAttempt
        : undefined;
    const canViewResult =
      typeof req.body?.canViewResult === 'boolean'
        ? req.body.canViewResult
        : undefined;
    const assignmentId = normalizeStringInput(req.body?.assignmentId);
    const chatSessionId = normalizeStringInput(req.body?.chatSessionId);
    const chatSessionTitle = normalizeStringInput(req.body?.chatSessionTitle);
    const type = normalizePromptType(req.body?.type);

    if (!userId) {
      return res
        .status(401)
        .json(Responses.errorResponse(new Error('Unauthorized')));
    }

    if (!prompt) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Prompt is required')));
    }

    try {
      const result = await AIChatSessionServices.sendMessage({
        userId,
        prompt,
        ...(assignmentTitle ? { assignmentTitle } : {}),
        ...(assignmentDescription ? { assignmentDescription } : {}),
        ...(classId ? { classId } : {}),
        ...(dueDate ? { dueDate } : {}),
        ...(typeof isPublic === 'boolean' ? { isPublic } : {}),
        ...(typeof isSingleAttempt === 'boolean' ? { isSingleAttempt } : {}),
        ...(typeof canViewResult === 'boolean' ? { canViewResult } : {}),
        ...(assignmentId ? { assignmentId } : {}),
        ...(chatSessionId ? { chatSessionId } : {}),
        ...(chatSessionTitle ? { chatSessionTitle } : {}),
        ...(type ? { type } : {})
      });

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'AI chat message processed successfully',
            result
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getChatSessionById = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.userId;
    const chatSessionId = normalizeStringInput(req.params.chatSessionId);

    if (!userId) {
      return res
        .status(401)
        .json(Responses.errorResponse(new Error('Unauthorized')));
    }

    if (!chatSessionId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(new Error('Chat session ID is required'))
        );
    }

    try {
      const chatSession = await AIChatSessionServices.getChatSessionById(
        chatSessionId,
        userId
      );

      if (!chatSession) {
        return res
          .status(404)
          .json(Responses.errorResponse(new Error('Chat session not found')));
      }

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Chat session fetched successfully',
            chatSession
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static getChatSessionsByAssignmentId = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.userId;
    const assignmentId = normalizeStringInput(req.params.assignmentId);

    if (!userId) {
      return res
        .status(401)
        .json(Responses.errorResponse(new Error('Unauthorized')));
    }

    if (!assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const sessions =
        await AIChatSessionServices.getChatSessionsByAssignmentId(
          assignmentId,
          userId
        );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Chat sessions fetched successfully',
            sessions
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };

  static linkChatSessionToAssignment = async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.userId;
    const chatSessionId = normalizeStringInput(req.params.chatSessionId);
    const assignmentId = normalizeStringInput(req.body?.assignmentId);

    if (!userId) {
      return res
        .status(401)
        .json(Responses.errorResponse(new Error('Unauthorized')));
    }

    if (!chatSessionId) {
      return res
        .status(400)
        .json(
          Responses.errorResponse(new Error('Chat session ID is required'))
        );
    }

    if (!assignmentId) {
      return res
        .status(400)
        .json(Responses.errorResponse(new Error('Assignment ID is required')));
    }

    try {
      const chatSession = await AIChatSessionServices.linkSessionToAssignment(
        chatSessionId,
        assignmentId,
        userId
      );

      return res
        .status(200)
        .json(
          Responses.successResponse(
            'Chat session linked successfully',
            chatSession
          )
        );
    } catch (error) {
      return res.status(400).json(Responses.errorResponse(error));
    }
  };
}

export default AIChatSessionController;
