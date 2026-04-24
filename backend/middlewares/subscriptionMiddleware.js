import PlatformConfig from '../models/PlatformConfig.js';
import User from '../models/User.js';

/**
 * Middleware to check if a recruiter has an active subscription.
 * Logic:
 * 1. If freeMode is TRUE, access is granted to everyone.
 * 2. If subscriptionEnabled is FALSE, access is granted.
 * 3. Otherwise, check user.isActive and user.subscriptionEnd.
 */
export const checkSubscription = async (req, res, next) => {
    try {
        const config = await PlatformConfig.findOne();
        
        // Default behavior if config not found (should not happen in production)
        if (!config) return next();

        // 1. Free Mode Override
        if (config.freeMode) {
            return next();
        }

        // 2. Subscription System Global Override
        if (!config.subscriptionEnabled) {
            return next();
        }

        // 3. User Level Validation
        const user = await User.findById(req.user._id);
        
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            return next(); // Admins bypass subscription checks
        }

        if (user.role === 'RECRUITER') {
            const now = new Date();
            if (user.isActive && user.subscriptionEnd && user.subscriptionEnd > now) {
                return next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Active subscription required. Please upgrade your plan.',
                    requiresUpgrade: true
                });
            }
        }

        // Candidates typically don't pay in this model, but we can add candidate checks here if needed
        next();

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
