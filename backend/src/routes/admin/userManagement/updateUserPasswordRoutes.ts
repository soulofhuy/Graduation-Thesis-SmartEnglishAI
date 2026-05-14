import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import UpdateUserPasswordController from '../../../controllers/admin/userManagement/updateUserPasswordController';

const router = Router();

router.patch(
  '/admin/update-password/:userId',
  verifyJWT,
  UpdateUserPasswordController.handle
);

export default router;
