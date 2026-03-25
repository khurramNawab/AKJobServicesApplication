import express from 'express';
import { registerUser, loginUser, getMe, sendOTP, verifyOTP } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgot-password/send-otp', sendOTP);
router.post('/forgot-password/verify', verifyOTP);

export default router;
