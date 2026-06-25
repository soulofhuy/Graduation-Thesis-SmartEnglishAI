import { Router } from 'express';
import AttemptController from '../controllers/attemptController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/attempts/start',
  verifyJWT,
  AttemptController.startOrGetInProgressAttempt
);

router.get(
  '/attempts/latest/:assignmentId',
  verifyJWT,
  AttemptController.getLatestAttemptForStudent
);

router.post('/attempts/submit', verifyJWT, AttemptController.submitAttempt);

router.patch('/attempts/:attemptId/draft', verifyJWT, AttemptController.saveDraft);

export default router;
