import { Router } from 'express';
import GetAllUsersRoutes from './getAllUsersRoutes';
import GetAllTeachersRoutes from './getAllTeachersRoutes';
import UpdateUserPasswordRoutes from './updateUserPasswordRoutes';
import GetUserProfileRoutes from './getUserProfileRoutes';
import UpdateUserProfileRoutes from './updateUserProfileRoutes';
import ToggleUserActiveRoutes from './toggleUserActiveRoutes';

const router = Router();

router.use(GetAllUsersRoutes);
router.use(GetAllTeachersRoutes);
router.use(UpdateUserPasswordRoutes);
router.use(GetUserProfileRoutes);
router.use(UpdateUserProfileRoutes);
router.use(ToggleUserActiveRoutes);

export default router;
