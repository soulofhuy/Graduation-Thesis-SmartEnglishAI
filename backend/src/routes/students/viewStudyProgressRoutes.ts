import { Router } from 'express';
import ViewStudyProgressController from '../../controllers/students/viewStudyProgressController';
import verifyJWT from '../../middlewares/authMiddleware';

const router = Router();

router.get(
  '/students/study-progress',
  verifyJWT,
  ViewStudyProgressController.getStudyProgress
);

export default router;
