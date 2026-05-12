import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import ToggleUserActiveController from '../../../controllers/admin/userManagement/toggleUserActiveController';

const router = Router();

router.patch(
  '/admin/toggle-user/:userId',
  verifyJWT,
  ToggleUserActiveController.handle
);

export default router;
