import AuditLog from '../models/AuditLog.js';

/**
 * Record an admin action in the audit log.
 * Fire-and-forget — never blocks the response.
 *
 * @param {Object} req     - Express request (for IP/UA extraction)
 * @param {String} action  - One of the AuditLog.action enum values
 * @param {Object} opts    - { targetId, targetType, details }
 */
export const logAdminAction = (req, action, opts = {}) => {
    // During login, req.user is not yet available, so we fallback to opts.targetId
    const adminId = req.user?._id || (action === 'ADMIN_LOGIN' ? opts.targetId : null);

    AuditLog.create({
        adminId,
        action,
        targetId: opts.targetId || null,
        targetType: opts.targetType || null,
        details: opts.details || '',
        ipAddress: req.ip || req.connection?.remoteAddress || '',
        userAgent: (req.get('User-Agent') || '').substring(0, 300),
    }).catch(err => console.error('[AUDIT] Failed to write log:', err.message));
};
