import { Router } from 'express';
import {
  handleResultAnalysisChat,
  handleGetAnalysisChatHistory
} from '@/controllers/ai/result-analysis/resultAnalysisController';
import verifyJWT from '@/middlewares/authMiddleware';

const router = Router();

router.post('/result-analysis/chat', verifyJWT, handleResultAnalysisChat);
router.get(
  '/result-analysis/chat/history/:userId',
  verifyJWT,
  handleGetAnalysisChatHistory
);

export default router;
