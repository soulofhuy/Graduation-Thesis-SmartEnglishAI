import { Router } from 'express';
import verifyJWT from '../../middlewares/authMiddleware';
import ViewClassProgressOnAssignmentsController from '../../controllers/teachers/viewClassProgressOnAssignmentsController';

const router = Router();

router.get(
  '/teachers/classes/:classId/progress-on-assignments',
  verifyJWT,
  ViewClassProgressOnAssignmentsController.getClassProgressOnAssignments
);

router.get(
  '/teachers/assignments/:assignmentId/students/:studentId',
  verifyJWT,
  ViewClassProgressOnAssignmentsController.getStudentAssignmentProgressDetail
);

export default router;
