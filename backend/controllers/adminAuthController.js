import User from '../models/User.js';
import { sendTokenResponse, clearTokens } from '../utils/tokenService.js';
import { logAdminAction } from '../utils/auditLogger.js';
import { sendAdminAlertEmail } from '../utils/emailService.js';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(128),
});

// Admin role hierarchy — who counts as "admin-level"
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// @desc    Authenticate Admin
// @route   POST /api/v1/auth/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        console.log(`[AUTH] Admin Login Request: ${req.body.email}`);
        
        const validated = loginSchema.parse(req.body);
        const { email, password } = validated;

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password +failedLoginAttempts +lockUntil');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials - Admin not found' });
        }

        // Strict role gate
        if (!ADMIN_ROLES.includes(user.role)) {
            console.warn(`[SECURITY] Unauthorized entry attempt by role: ${user.role} | Email: ${email}`);
            sendAdminAlertEmail(
                'Unauthorized Admin Login Attempt',
                `Email <strong>${email}</strong> (role: ${user.role}) attempted admin login from IP <strong>${req.ip}</strong>.`
            ).catch(() => {});
            return res.status(403).json({ success: false, message: 'Access denied. Authorized personnel only.' });
        }

        // Account lock check
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
            return res.status(423).json({ success: false, message: `Account temporarily locked for security. Try again in ${minutesLeft} mins.` });
        }

        // Password verification
        const isMatch = await user.matchPassword(password);
        console.log(`[AUTH] Password match status: ${isMatch}`);

        if (!isMatch) {
            await user.registerFailedLogin();
            return res.status(401).json({ success: false, message: 'Invalid credentials - Access Denied' });
        }

        // Success
        await user.resetFailedLogins();
        await User.findByIdAndUpdate(user._id, { $inc: { loginCount: 1 } });

        // Audit log (Safe now with the fix in auditLogger.js)
        logAdminAction(req, 'ADMIN_LOGIN', {
            targetId: user._id,
            targetType: 'User',
            details: `Admin ${user.name} logged in`,
        });

        await sendTokenResponse(user, 200, res, req);
    } catch (error) {
        console.error("Critical Admin Login Error:", error);
        if (error instanceof z.ZodError) {
            const errorMsg = error.errors.map(e => e.message).join(', ');
            return res.status(400).json({ success: false, message: errorMsg, errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message || 'Platform Logic Error' });
    }
};

// @desc    Logout Admin
// @route   POST /api/v1/auth/admin/logout
// @access  Private
export const logoutAdmin = async (req, res) => {
    logAdminAction(req, 'ADMIN_LOGOUT', { details: `Admin ${req.user.name} logged out` });
    await clearTokens(req.user._id, res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
