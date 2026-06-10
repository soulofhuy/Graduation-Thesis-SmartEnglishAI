import express from 'express';
import { requestPasswordReset, verifyPasswordResetOTP, resetPassword } from '../controllers/forgotPasswordController';

const router = express.Router();

router.post('/auth/forgot-password', requestPasswordReset);
router.post('/auth/verify-otp', verifyPasswordResetOTP);
router.post('/auth/reset-password', resetPassword);

export default router;
