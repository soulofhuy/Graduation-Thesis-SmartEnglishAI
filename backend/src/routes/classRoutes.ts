import { Router } from 'express';
import ClassController from '../controllers/classController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/classes', verifyJWT, ClassController.createClass);

router.post(
  '/classes/generate-code',
  verifyJWT,
  ClassController.generateUniqueClassCode
);

router.get(
  '/classes/deactivated',
  verifyJWT,
  ClassController.getAllDeactivatedClassesByTeacherId
);

router.get('/classes/:classId', verifyJWT, ClassController.getClassById);

router.patch(
  '/classes/:classId',
  verifyJWT,
  ClassController.updateClassInformation
);

router.patch(
  '/classes/:classId/toggle-status',
  verifyJWT,
  ClassController.toggleClassStatus
);

router.get(
  '/classes-by-teacher/:teacherId',
  verifyJWT,
  ClassController.getClassesByTeacherId
);

export default router;
