import { Router } from 'express';
import GetAllUsersRoutes from './getAllUsersRoutes';
import UpdateUserPasswordRoutes from './updateUserPasswordRoutes';
import GetUserProfileRoutes from './getUserProfileRoutes';
import UpdateUserProfileRoutes from './updateUserProfileRoutes';

const router = Router();

router.use(GetAllUsersRoutes);
router.use(UpdateUserPasswordRoutes);
router.use(GetUserProfileRoutes);
router.use(UpdateUserProfileRoutes);

export default router;
