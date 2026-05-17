import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetAllAssignmentController from '../../../controllers/admin/assignmentManagement/getAllAssignmentController';

const router = Router();

router.get(
  '/admin/get-all-assignments',
  verifyJWT,
  GetAllAssignmentController.handle
);

export default router;
