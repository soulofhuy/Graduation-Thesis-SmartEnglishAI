import { Router } from 'express';
import ProfileController from '../controllers/profileController';
import verifyJWT from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile/me', verifyJWT, ProfileController.getMyProfile);
router.put('/profile/me', verifyJWT, ProfileController.updateMyProfile);

export default router;
