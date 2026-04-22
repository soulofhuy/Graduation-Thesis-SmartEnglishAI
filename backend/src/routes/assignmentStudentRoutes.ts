import { Router } from 'express';
import AssignmentStudentController from '../controllers/assignmentStudentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/assignments-students/get-assignments-for-student',
  verifyJWT,
  AssignmentStudentController.getAssignmentsAssignedToStudentClasses
);

router.get(
  '/assignments-for-student/:assignmentId',
  verifyJWT,
  AssignmentStudentController.getAssignmentByIdForStudentToDoTest
);

router.get(
  '/assignments-students/history',
  verifyJWT,
  AssignmentStudentController.getAssignmentsHistoryOfStudent
);

export default router;
