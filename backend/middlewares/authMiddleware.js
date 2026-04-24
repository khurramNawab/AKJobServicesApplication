import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// @desc    Protect routes - Verify JWT in cookie or header
export const protect = async (req, res, next) => {
    let token;

    // 1. Check for token in cookies (Production Standard) or Authorization Header
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    } else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized - No token provided' 
        });
    }

    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user to request (Exclude password for security)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No user found with this id' 
            });
        }

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ 
            success: false, 
            message: 'Not authorized - Token failed or expired' 
        });
    }
};

// @desc    Authorize roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role (${req.user?.role || 'Unknown'}) is not authorized to access this resource`
            });
        }
        next();
    };
};

