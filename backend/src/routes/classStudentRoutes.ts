import { Router } from 'express';
import ClassStudentController from '../controllers/classStudentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/classes/join',
  verifyJWT,
  ClassStudentController.studentJoinClass
);

router.get(
  '/classes/pending-requests',
  verifyJWT,
  ClassStudentController.getAllRequestsToJoinClassByStudent
);

router.get(
  '/classes/approved',
  verifyJWT,
  ClassStudentController.getAllApprovedClassesByStudent
);

export default router;
