import express from 'express';
import { requestPasswordReset, verifyPasswordResetOTP, resetPassword } from '../controllers/forgotPasswordController';

const router = express.Router();

router.post('/forgot-password', requestPasswordReset);
router.post('/verify-otp', verifyPasswordResetOTP);
router.post('/reset-password', resetPassword);

export default router;
