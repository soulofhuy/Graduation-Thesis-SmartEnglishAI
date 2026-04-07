import { Router } from 'express';
import StudentController from '../controllers/studentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/get-banned-students-by-class/:classId',
  verifyJWT,
  StudentController.getBannedStudentsByClassId
);

router.patch(
  '/toggle-ban-student',
  verifyJWT,
  StudentController.toggleBanStudent
);

export default router;
