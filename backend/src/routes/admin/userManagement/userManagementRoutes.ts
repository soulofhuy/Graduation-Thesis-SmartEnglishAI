import { Router } from 'express';
import GetAllUsersRoutes from './getAllUsersRoutes';
import UpdateUserPasswordRoutes from './updateUserPasswordRoutes';
import GetUserProfileRoutes from './getUserProfileRoutes';
import UpdateUserProfileRoutes from './updateUserProfileRoutes';
import ToggleUserActiveRoutes from './toggleUserActiveRoutes';

const router = Router();

router.use(GetAllUsersRoutes);
router.use(UpdateUserPasswordRoutes);
router.use(GetUserProfileRoutes);
router.use(UpdateUserProfileRoutes);
router.use(ToggleUserActiveRoutes);

export default router;
