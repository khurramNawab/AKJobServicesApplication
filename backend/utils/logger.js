/**
 * Lightweight monitoring for tracking delayed paths, slow endpoints, or suspicious behavior.
 */

// Middleware for monitoring API speed
export const requestTimer = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        // Flag arbitrary slowness threshold > 500ms
        if (duration > 500) {
            console.warn(`[MONITOR WARNING] SLOW API DETECTED: [${req.method}] ${req.originalUrl} took ${duration}ms (IP: ${req.ip})`);
        }
    });
    next();
};

export const logSuspiciousActivity = (action, details, ip) => {
    // In larger setups, this would send an SMS or Slack alert
    console.warn(`[SUSPICIOUS ACTIVITY] Action: ${action} | IP: ${ip} | Details: ${details}`);
};
