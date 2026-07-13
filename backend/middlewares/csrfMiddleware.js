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
        const host = (req.get("host") || "").toLowerCase();
        const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes("10.0.2.2");
        const isHttps = req.secure || req.get("X-Forwarded-Proto") === "https";
        // Only use secure cookie if actually on HTTPS AND not localhost
        const useSecure = !isLocal && isHttps;
        res.cookie('XSRF-TOKEN', token, {
            secure: useSecure,
            sameSite: useSecure ? 'Strict' : 'Lax',
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
