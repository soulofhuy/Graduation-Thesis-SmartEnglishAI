import { Router } from 'express';
import AssignmentController from '../controllers/assignmentController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/assignments', verifyJWT, AssignmentController.createAssignment);

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
