import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetResultDetailsController from '../../../controllers/admin/resultManagement/getResultDetailsController';

const router = Router();

router.get(
  '/admin/assignments/:assignmentId/students/:studentId',
  verifyJWT,
  GetResultDetailsController.getStudentAssignmentProgressDetail
);

export default router;
