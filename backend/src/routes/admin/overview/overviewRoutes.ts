import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import AdminOverviewController from '../../../controllers/admin/overview/overviewController';

const router = Router();

router.get(
  '/admin/overview',
  verifyJWT,
  AdminOverviewController.getAdminOverview
);

export default router;
