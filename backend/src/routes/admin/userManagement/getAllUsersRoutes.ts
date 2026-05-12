import { Router } from 'express';
import verifyJWT from '../../../middlewares/authMiddleware';
import GetAllUsersController from '../../../controllers/admin/userManagement/getAllUsersController';

const router = Router();

router.get('/admin/get-all-users', verifyJWT, GetAllUsersController.handle);

export default router;
