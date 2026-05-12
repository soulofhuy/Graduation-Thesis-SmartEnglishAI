import { Router } from 'express';
import GetAllUsersRoutes from './getAllUsersRoutes';
import UpdateUserPasswordRoutes from './updateUserPasswordRoutes';

const router = Router();

router.use(GetAllUsersRoutes);
router.use(UpdateUserPasswordRoutes);

export default router;
