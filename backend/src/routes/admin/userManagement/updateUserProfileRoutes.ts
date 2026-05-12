import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import UpdateUserProfileController from '../../../controllers/admin/userManagement/updateUserProfileController';

const router = Router();

router.patch(
  '/admin/update-user/:userId',
  verifyJWT,
  UpdateUserProfileController.handle
);

export default router;
