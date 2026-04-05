import { Router } from 'express';
import ClassController from '../controllers/classController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/get-students-by-class/:classId',
  verifyJWT,
  ClassController.getStudentsByClassId
);

export default router;
