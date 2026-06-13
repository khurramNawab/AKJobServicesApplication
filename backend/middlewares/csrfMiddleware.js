import crypto from 'crypto';

/**
 * CSRF Protection Middleware - Double Submit Cookie Pattern
 * Safe for APIs where cookies are used for auth.
 */

export const generateCsrfToken = (req, res, next) => {
    // If token already exists, don't overwrite it
    let token = req.cookies['XSRF-TOKEN'];
    if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        // Must NOT be httpOnly so frontend JS can read it and send it in headers
        res.cookie('XSRF-TOKEN', token, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
            path: '/',
            httpOnly: false 
        });
    }
    req.csrfToken = token;
    next();
};

export const csrfProtection = (req, res, next) => {
    // Mobile apps bypass CSRF protection as they do not use cookie-based storage in a web context
    if (req.headers['x-client-type'] === 'mobile') {
        return next();
    }

    // Safe HTTP methods that don't modify state
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies['XSRF-TOKEN'];
    const headerToken = req.headers['x-xsrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        console.warn(`[SECURITY] CSRF attempt detected. IP: ${req.ip}`);
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or missing CSRF token' 
        });
    }

    next();
};
