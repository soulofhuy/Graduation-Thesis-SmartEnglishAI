import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetUserProfileController from '../../../controllers/admin/userManagement/getUserProfileController';

const router = Router();

router.get(
  '/admin/get-user/:userId',
  verifyJWT,
  GetUserProfileController.handle
);

export default router;
