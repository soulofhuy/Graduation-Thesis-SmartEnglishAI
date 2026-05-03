import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import AIGenerateAssignmentController from '@/controllers/ai/generate-assignment/aiGenerateAssignmentController';

const router = Router();

router.post(
  '/ai/generate-assignment',
  verifyJWT,
  AIGenerateAssignmentController.generateAssignment
);

export default router;
