import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import DeleteAssignmentController from '../../../controllers/admin/assignmentManagement/deleteAssignmentController';

const router = Router();

router.delete(
  '/admin/delete-assignment/:assignmentId',
  verifyJWT,
  DeleteAssignmentController.handle
);

export default router;
