import { Router } from 'express';
import ClassController from '../controllers/classController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/classes', verifyJWT, ClassController.createClass);
router.patch(
  '/classes/:classId/toggle-approval',
  verifyJWT,
  ClassController.toggleTeacherApproval
);
router.get('/classes/:classId', verifyJWT, ClassController.getClassById);
router.get(
  '/classes-by-teacher/:teacherId',
  verifyJWT,
  ClassController.getClassesByTeacherId
);
router.patch(
  '/classes/:classId/toggle-status',
  verifyJWT,
  ClassController.toggleClassStatus
);

export default router;
