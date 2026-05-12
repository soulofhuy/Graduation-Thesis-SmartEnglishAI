import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import UserManagementController from '../../../controllers/admin/userManagement/userManagementController';

const router = Router();

router.get(
  '/admin/get-all-users',
  verifyJWT,
  UserManagementController.getAllUsers
);

export default router;
