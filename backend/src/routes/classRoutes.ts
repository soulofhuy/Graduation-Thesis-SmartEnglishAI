import { Router } from 'express';
import ClassController from '../controllers/classController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/classes', verifyJWT, ClassController.createClass);

router.patch(
  '/classes/:classId',
  verifyJWT,
  ClassController.updateClassInformation
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

router.post(
  '/classes/generate-code',
  verifyJWT,
  ClassController.generateUniqueClassCode
);

export default router;
