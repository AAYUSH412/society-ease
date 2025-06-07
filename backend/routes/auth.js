import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  resendEmailVerification
} from '../controllers/authController.js';
import { protect, loginRateLimit } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', loginRateLimit, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-email-verification', resendEmailVerification);

// Protected routes
router.get('/me', protect, getMe);

export default router;
