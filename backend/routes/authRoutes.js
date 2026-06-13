import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  googleLogin,
  getMe,
  sendOTP,
  verifyOTP,
  verifyEmail,
  resendVerification,
  logoutUser,
  logoutAllDevices,
  getActiveSessions,
  revokeSession,
} from "../controllers/authController.js";
import { loginAdmin, logoutAdmin } from "../controllers/adminAuthController.js";
import { rotateRefreshToken } from "../utils/tokenService.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

import {
  loginLimiter,
  registerLimiter,
  otpLimiter
} from "../middlewares/rateLimiterMiddleware.js";

// ═══ User Auth ═════════════════════════════════════════════════════
router.post("/register", registerLimiter, registerUser);
router.post("/login", loginLimiter, loginUser);
router.post("/google-login", loginLimiter, googleLogin);
router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, logoutAllDevices);
router.get("/me", protect, getMe);
router.get("/sessions", protect, getActiveSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);
router.post("/refresh-token", loginLimiter, rotateRefreshToken);

// ═══ Email Verification (Link-based only) ═════════════════════════
router.get("/verify-email/:token", otpLimiter, verifyEmail);
router.post("/resend-verification", otpLimiter, resendVerification);

// ═══ Admin Auth (Isolated) ════════════════════════════════════════
router.post("/admin/login", loginLimiter, loginAdmin);
router.post("/admin/logout", protect, logoutAdmin);

// ═══ Password Reset ════════════════════════════════════════════════
router.post("/forgot-password/send-otp", otpLimiter, sendOTP);
router.post("/forgot-password/verify", otpLimiter, verifyOTP);

export default router;
