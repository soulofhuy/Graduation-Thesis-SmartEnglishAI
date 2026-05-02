import { Router } from 'express';
import ClassTeacherController from '../controllers/classTeacherController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/classes', verifyJWT, ClassTeacherController.createClass);

router.post(
  '/classes/generate-code',
  verifyJWT,
  ClassTeacherController.generateUniqueClassCode
);

router.get(
  '/classes/deactivated',
  verifyJWT,
  ClassTeacherController.getAllDeactivatedClassesByTeacherId
);

router.delete(
  '/classes/delete/:classId',
  verifyJWT,
  ClassTeacherController.deleteClass
);

router.get('/classes/:classId', verifyJWT, ClassTeacherController.getClassById);

router.patch(
  '/classes/approve-student',
  verifyJWT,
  ClassTeacherController.approveStudentJoinClass
);

router.patch(
  '/classes/reject-student',
  verifyJWT,
  ClassTeacherController.rejectStudentJoinClass
);

router.patch(
  '/classes/:classId',
  verifyJWT,
  ClassTeacherController.updateClassInformation
);

router.patch(
  '/classes/:classId/toggle-status',
  verifyJWT,
  ClassTeacherController.toggleClassStatus
);

router.get(
  '/classes-by-teacher/:teacherId',
  verifyJWT,
  ClassTeacherController.getClassesByTeacherId
);

export default router;
