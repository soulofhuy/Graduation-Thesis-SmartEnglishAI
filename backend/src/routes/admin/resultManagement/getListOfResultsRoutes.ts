import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetListOfResultsController from '../../../controllers/admin/resultManagement/getListOfResultsController';

const router = Router();

router.get(
  '/admin/classes/:classId/assignments/:assignmentId/progress-on-assignments',
  verifyJWT,
  GetListOfResultsController.getClassProgressOnAssignments
);

export default router;
