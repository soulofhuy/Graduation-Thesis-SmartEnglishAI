import { Router } from 'express';
import ClassStudentController from '../controllers/classStudentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post(
  '/classes/join',
  verifyJWT,
  ClassStudentController.studentJoinClass
);

export default router;
