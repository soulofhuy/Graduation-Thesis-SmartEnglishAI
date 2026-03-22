import { Router } from 'express';
import AuthController from '../controllers/authController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.post('/auth/change-password', verifyJWT, AuthController.changePassword);

export default router;
