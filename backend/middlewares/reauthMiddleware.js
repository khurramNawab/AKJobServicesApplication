import bcrypt from 'bcryptjs';
import User from '../models/User.js';

/**
 * Requires 'sudo' context (re-authentication via password).
 * Used for critical admin actions (e.g. deleting users, banning).
 * Expects `sudoPassword` in body OR `x-sudo-password` inside headers.
 */
export const requireReauth = async (req, res, next) => {
    try {
        // Only run check on destructive/sensitive paths
        const isDelete = req.method === 'DELETE';
        const isBanAction = req.method === 'PUT' && req.body.isBanned !== undefined;
        
        if (!isDelete && !isBanAction) {
            return next(); // Safe to proceed without password confirm
        }

        const passwordToVerify = req.body.sudoPassword || req.headers['x-sudo-password'];

        if (!passwordToVerify) {
            return res.status(401).json({ 
                success: false, 
                message: 'This action requires re-authentication. Please provide your password.' 
            });
        }

        // Fetch user with password since it is excluded by default
        const user = await User.findById(req.user._id).select('+password');
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(passwordToVerify, user.password);

        if (!isMatch) {
            console.warn(`[SECURITY] Failed re-auth attempt by ${user.email} from IP: ${req.ip}`);
            return res.status(401).json({ success: false, message: 'Re-authentication failed. Incorrect password.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
