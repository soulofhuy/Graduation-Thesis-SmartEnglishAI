import { Response } from 'express';
import {
  saveResultAnalysisChat,
  getAnalysisChatHistory
} from '@/services/ai/result-analysis/resultAnalysisServices';
import { AuthenticatedRequest } from '@/middlewares/authMiddleware';

export const handleResultAnalysisChat = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { chatSessionId, prompt, response, assignmentId, classId } = req.body;
  const userId = req.userId;

  if (!userId || !prompt || !response) {
    return res.status(400).json({
      error: 'Missing required fields: userId, prompt, and response.'
    });
  }

  try {
    const chatData = await saveResultAnalysisChat(
      userId,
      chatSessionId,
      prompt,
      response,
      assignmentId,
      classId
    );
    res.status(201).json(chatData);
  } catch (error) {
    console.error('Error saving result analysis chat:', error);
    res
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
    res.status(200).json(history);
  } catch (error) {
    console.error('Error getting result analysis chat history:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while getting the chat history.' });
  }
};
