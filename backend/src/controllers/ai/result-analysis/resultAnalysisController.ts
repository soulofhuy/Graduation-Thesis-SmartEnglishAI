import { Request, Response } from 'express';
import {
  saveResultAnalysisChat,
  getAnalysisChatHistory
} from '@/services/ai/result-analysis/resultAnalysisServices';

export const handleResultAnalysisChat = async (req: Request, res: Response) => {
  const { userId, chatSessionId, prompt, response, assignmentId, classId } =
    req.body;

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
  req: Request,
  res: Response
) => {
  const { userId: rawUserId } = req.params;

  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

  if (!userId) {
    return res.status(400).json({ error: 'Missing required field: userId.' });
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
