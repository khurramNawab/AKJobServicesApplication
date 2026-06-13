import User from '../models/User.js';
import { sendTokenResponse, clearTokens, clearAllSessions } from '../utils/tokenService.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendAccountLockedEmail } from '../utils/emailService.js';
import { OAuth2Client } from "google-auth-library";
import { z } from 'zod';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Validation Schemas ─────────────────────────────────────────────
const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    role: z.enum(['CANDIDATE', 'RECRUITER']).default('CANDIDATE'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(128),
});

// ═══════════════════════════════════════════════════════════════════
//  REGISTER
// ═══════════════════════════════════════════════════════════════════

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const validated = registerSchema.parse(req.body);
        const { name, email, password, role } = validated;

        // Duplicate check
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isVerified: false,
            loginCount: 0,
        });

        // Generate secure, single-use SHA-256 hashed email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.verificationToken = hashedToken;
        user.verificationTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
        await user.save();

        // Send branded HTML verification email — link only, no OTP
        await sendVerificationEmail(email, name, verificationToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
            email: user.email,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMsg = error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ success: false, message: errorMsg, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  LOGIN — with account locking & IP tracking
// ═══════════════════════════════════════════════════════════════════

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        const { email, password } = validated;

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +failedLoginAttempts +lockUntil');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Please verify your email before logging in.',
                needsVerification: true,
                email: user.email 
            });
        }

        // Check ban
        if (user.isBanned) {
            return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
        }

        // Check account lock
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again in ${minutesLeft} minute(s).`,
            });
        }

        // Verify password
        if (!user.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'This account is linked with Google. To enable manual login, please use "Forgot Password" to set a credential, or simply use Google Sign-In.' 
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            const locked = await user.registerFailedLogin();
            console.warn(`[AUTH] Login failed (Credentials): ${email} - Attempts remaining: ${5 - user.failedLoginAttempts}`);
            if (locked && user.email) {
                sendAccountLockedEmail(user.email, user.name).catch(() => {});
            }
            const remaining = 5 - (user.failedLoginAttempts || 0);
            return res.status(401).json({
                success: false,
                message: locked
                    ? 'Account locked due to too many failed attempts. Try again in 30 minutes.'
                    : `Invalid credentials. ${remaining > 0 ? remaining : 0} attempt(s) remaining.`,
            });
        }

        // ⚡ ATOMIC UPDATE: Track session and login count WITHOUT triggering pre-save hooks
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip || req.connection.remoteAddress;

        await User.findByIdAndUpdate(user._id, {
            $inc: { loginCount: 1 },
            $push: {
                sessions: {
                    $each: [{ deviceInfo, ipAddress, lastActive: new Date() }],
                    $slice: -5 // Keep last 5 sessions
                }
            },
            $set: {
                failedLoginAttempts: 0,
                lockUntil: null
            }
        });

        console.log(`[AUTH] Login success (Local): ${user.email} (ID: ${user._id})`);
        await sendTokenResponse(user, 200, res, req);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMsg = error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ success: false, message: errorMsg, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  GOOGLE LOGIN
// ═══════════════════════════════════════════════════════════════════

// @desc    Authenticate a user via Google Identity Services
// @route   POST /api/v1/auth/google-login
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'No credential provided' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture, email_verified, iss } = payload;

        // Validate issuer
        if (!['accounts.google.com', 'https://accounts.google.com'].includes(iss)) {
             return res.status(403).json({ success: false, message: 'Invalid token issuer' });
        }

        if (!email_verified) {
            return res.status(403).json({ success: false, message: 'Google email not verified' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Allow auto-linking if Google email is verified (which we checked above)
            if (user.isBanned) {
                return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
            }
            // Update provider if it was local to allow hybrid access
            if (user.authProvider === 'LOCAL') {
                user.authProvider = 'GOOGLE'; // Mark as hybrid-capable
            }
        } else {
            // Remove random password hack; model now requires password only for LOCAL
            user = await User.create({
                name,
                email: email.toLowerCase(),
                role: 'CANDIDATE',
                authProvider: 'GOOGLE',
                isVerified: true,
                loginCount: 1,
            });
            // Google accounts are pre-verified — no welcome email needed here
        }

        // Add session logging
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip || req.connection.remoteAddress;

        user.sessions.push({
            deviceInfo,
            ipAddress,
            lastActive: new Date()
        });
        user.loginCount += 1;

        if (user.failedLoginAttempts > 0 || user.lockUntil) {
            user.failedLoginAttempts = 0;
            user.lockUntil = null;
        }
        await user.save();

        console.log(`[AUTH] Login success (Google): ${user.email} (ID: ${user._id})`);
        await sendTokenResponse(user, 200, res, req);
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ success: false, message: 'Google authentication failed' });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  PASSWORD RESET — OTP-based (for forgot-password only)
// ═══════════════════════════════════════════════════════════════════

// @desc    Send password reset OTP
// @route   POST /api/v1/auth/forgot-password/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase() });

        if (!user) {
            // Security: don't reveal if email exists
            return res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
        }

        // Generate a secure 6-digit numeric OTP for password reset
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedReset = crypto.createHash('sha256').update(otpCode).digest('hex');
        
        user.otp = hashedReset;
        user.otpExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 min
        await user.save();

        // Send password reset email with the numeric OTP
        sendPasswordResetEmail(user.email, user.name, otpCode).catch(() => {});

        console.log(`[AUTH] Password reset OTP sent to: ${user.email}`);
        res.status(200).json({ success: true, message: 'If an account exists, a reset email has been sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify reset token & set new password
// @route   POST /api/v1/auth/forgot-password/verify
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { email, otp: resetToken, newPassword } = req.body;

        const hashedReset = crypto.createHash('sha256').update(resetToken).digest('hex');

        const user = await User.findOne({
            email: email?.toLowerCase(),
            otp: hashedReset,
            otpExpire: { $gt: Date.now() },
        }).select('+otp +otpExpire');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        user.otp = undefined;
        user.otpExpire = undefined;
        if (newPassword) user.password = newPassword;
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resend email verification link (link-based only, no OTP)
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email?.toLowerCase(), isVerified: false });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found or already verified.' });
        }

        // Generate new verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        user.verificationToken = hashedToken;
        user.verificationTokenExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save();

        // Send fresh verification link email
        await sendVerificationEmail(user.email, user.name, verificationToken);

        console.log(`[AUTH] Resent verification link to: ${user.email}`);
        res.status(200).json({ success: true, message: 'A new verification link has been sent to your email.' });
    } catch (error) {
        console.error('[AUTH] Resend Verification Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Email via Token
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const token = req.params.token;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Verification token is required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // 1. Find user by token (unconditional on expiry for better error reporting)
        const user = await User.findOne({
            verificationToken: hashedToken
        }).select('+verificationToken +verificationTokenExpire +isVerified');

        // 2. CASE: Token not found
        if (!user) {
            console.warn(`[AUTH] Token not found in DB. Hash: ${hashedToken.substring(0, 16)}...`);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid verification link. It may have already been used or never existed.' 
            });
        }

        // 3. CASE: Already verified (redundant but safe)
        if (user.isVerified) {
            user.verificationToken = undefined;
            user.verificationTokenExpire = undefined;
            await user.save();
            return res.status(400).json({ success: false, message: 'Email is already verified. Please login.' });
        }

        // 4. CASE: Token expired
        if (user.verificationTokenExpire && user.verificationTokenExpire < Date.now()) {
            console.warn(`[AUTH] Expired token attempt by: ${user.email}`);
            return res.status(401).json({ 
                success: false, 
                message: 'Verification link expired. Please request a new one.',
                expired: true,
                email: user.email
            });
        }

        // 5. SUCCESS: Mark as verified, enforce single-use token
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        user.otp = undefined;
        user.otpExpire = undefined;
        user.loginCount = 1;
        await user.save();

        console.log(`[AUTH] Email verified successfully: ${user.email}`);

        // Auto-login: issue access + refresh tokens in HTTP-only cookies
        return sendTokenResponse(user, 200, res, req);
    } catch (error) {
        console.error('[AUTH] Verify Email Error:', error);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  PROFILE & SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
        };
        res.status(200).json({ success: true, data: userData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Logout (current device)
// @route   POST /api/v1/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
    await clearTokens(req.user._id, res, req);
    res.status(200).json({ success: true, message: 'Logged out' });
};

// @desc    Logout from ALL devices
// @route   POST /api/v1/auth/logout-all
// @access  Private
export const logoutAllDevices = async (req, res) => {
    await clearAllSessions(req.user._id, res);
    res.status(200).json({ success: true, message: 'Logged out from all devices' });
};

// @desc    Get active sessions
// @route   GET /api/v1/auth/sessions
// @access  Private
export const getActiveSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('sessions');
        res.status(200).json({ success: true, data: user.sessions || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Revoke specific session
// @route   DELETE /api/v1/auth/sessions/:sessionId
// @access  Private
export const revokeSession = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { sessions: { _id: req.params.sessionId } } },
            { new: true }
        );
        res.status(200).json({ success: true, message: 'Session revoked successfully', data: user.sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
