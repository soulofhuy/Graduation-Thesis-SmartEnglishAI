import { Router } from 'express';
import verifyJWT from '../../middlewares/authMiddleware';
import ViewOverviewStatisticController from '../../controllers/teachers/viewOverviewStatisticController';

const router = Router();

router.get(
  '/teachers/overview',
  verifyJWT,
  ViewOverviewStatisticController.getTeacherOverview
);

export default router;
