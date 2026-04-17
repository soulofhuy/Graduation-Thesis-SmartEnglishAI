import { Router } from 'express';
import AssignmentController from '../controllers/assignmentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/assignments', verifyJWT, AssignmentController.createAssignment);

router.put(
  '/assignments/:assignmentId',
  verifyJWT,
  AssignmentController.updateAssignment
);

// Separate route for updating the entire assignment with tasks
router.put(
  '/assignments/:assignmentId/full',
  verifyJWT,
  AssignmentController.updateAssignmentFull
);

router.put(
  '/assignments/toggle-active-status/:assignmentId',
  verifyJWT,
  AssignmentController.toggleAssignmentActiveStatus
);

router.get(
  '/assignments/created-by-me',
  verifyJWT,
  AssignmentController.getAssignmentsCreatedByTeacher
);

router.get(
  '/assignments/:assignmentId',
  verifyJWT,
  AssignmentController.getAssignmentById
);

router.get(
  '/classes/:classId/assignments',
  verifyJWT,
  AssignmentController.getAssignmentsByClassId
);

export default router;
