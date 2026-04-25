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

// ── Rate Limiters ──────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many attempts. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many verification attempts. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many password reset requests. Try again in 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══ User Auth ═════════════════════════════════════════════════════
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google-login", authLimiter, googleLogin);
router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, logoutAllDevices);
router.get("/me", protect, getMe);
router.get("/sessions", protect, getActiveSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);
router.post("/refresh-token", authLimiter, rotateRefreshToken);

// ═══ Email Verification (Link-based only) ═════════════════════════
router.get("/verify-email/:token", verifyLimiter, verifyEmail);
router.post("/resend-verification", verifyLimiter, resendVerification);

// ═══ Admin Auth (Isolated) ════════════════════════════════════════
router.post("/admin/login", authLimiter, loginAdmin);
router.post("/admin/logout", protect, logoutAdmin);

// ═══ Password Reset ════════════════════════════════════════════════
router.post("/forgot-password/send-otp", resetLimiter, sendOTP);
router.post("/forgot-password/verify", resetLimiter, verifyOTP);

export default router;
