import { Router } from 'express';
import {
  handleResultAnalysisChat,
  handleGetAnalysisChatHistory,
  handleGetAnalysisChatSessionDetail
} from '@/controllers/ai/result-analysis/resultAnalysisController';
import verifyJWT from '@/middlewares/authMiddleware';

const router = Router();

router.post('/result-analysis/chat', verifyJWT, handleResultAnalysisChat);
router.get(
  '/result-analysis/chat/history',
  verifyJWT,
  handleGetAnalysisChatHistory
);
router.get(
  '/result-analysis/chat/:chatSessionId',
  verifyJWT,
  handleGetAnalysisChatSessionDetail
);

export default router;
