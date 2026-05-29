import { Response } from 'express';
import {
  saveResultAnalysisChat,
  getAnalysisChatHistory,
  getAnalysisChatSessionDetail
} from '@/services/ai/result-analysis/resultAnalysisServices';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';
import Responses from '@/utils/responses';

const normalizeStringInput = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
};

export const handleResultAnalysisChat = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { chatSessionId, prompt, response } = req.body;
  const userId = req.userId;

  if (!userId || !prompt || !response) {
    return res.status(400).json({
      error: 'Missing required fields: prompt and response.'
    });
  }

  try {
    const chatData = await saveResultAnalysisChat(
      userId,
      chatSessionId,
      prompt,
      response
    );

    return res.status(201).json(
      Responses.successResponse('Result analysis chat saved successfully', {
        session: chatData.session,
        aiResponse: {
          id: chatData.aiResponse.id,
          chatSessionId: chatData.session.id,
          content: chatData.aiResponse.response,
          createdAt: chatData.aiResponse.createdAt
        }
      })
    );
  } catch (error) {
    console.error('Error saving result analysis chat:', error);
    return res
      .status(500)
      .json({ error: 'An error occurred while saving the chat session.' });
  }
};

export const handleGetAnalysisChatHistory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const history = await getAnalysisChatHistory(userId);

    return res
      .status(200)
      .json(
        Responses.successResponse(
          'Result analysis chat history fetched',
          history
        )
      );
  } catch (error) {
    console.error('Error getting result analysis chat history:', error);
    return res
      .status(500)
      .json({ error: 'An error occurred while getting the chat history.' });
  }
};

export const handleGetAnalysisChatSessionDetail = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.userId;
  const chatSessionId = normalizeStringInput(req.params.chatSessionId);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!chatSessionId) {
    return res.status(400).json({ error: 'Chat session ID is required' });
  }

  try {
    const sessionDetail = await getAnalysisChatSessionDetail(
      userId,
      chatSessionId
    );

    if (!sessionDetail) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    return res
      .status(200)
      .json(
        Responses.successResponse(
          'Result analysis chat session detail fetched',
          sessionDetail
        )
      );
  } catch (error) {
    console.error('Error getting result analysis chat session detail:', error);
    return res.status(500).json({
      error: 'An error occurred while getting the chat session detail.'
    });
  }
};
