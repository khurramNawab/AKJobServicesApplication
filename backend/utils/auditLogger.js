import crypto from 'crypto';
import AuditLog from '../models/AuditLog.js';

/**
 * Record an admin action in the audit log with cryptographic chaining and tamper verification.
 * Fire-and-forget — never blocks the response.
 *
 * @param {Object} req     - Express request (for IP/UA extraction)
 * @param {String} action  - One of the AuditLog.action enum values
 * @param {Object} opts    - { targetId, targetType, details, beforeState, afterState }
 */
export const logAdminAction = async (req, action, opts = {}) => {
    try {
        const adminId = req.user?._id || (action === 'ADMIN_LOGIN' ? opts.targetId : null);
        const details = opts.details || '';
        const targetId = opts.targetId || null;
        const targetType = opts.targetType || null;
        const beforeState = opts.beforeState || null;
        const afterState = opts.afterState || null;
        const ipAddress = req.ip || req.connection?.remoteAddress || '';
        const userAgent = req.get ? (req.get('User-Agent') || '') : '';
        const cleanUserAgent = userAgent.substring(0, 300);

        // Fetch last log entry to retrieve its hash for chaining
        const lastEntry = await AuditLog.findOne().sort({ createdAt: -1 });
        const previousEntryHash = lastEntry ? lastEntry.hash : 'GENESIS_HASH';

        // Prepare deterministic serialization payload
        const payload = JSON.stringify({
            adminId: adminId?.toString() || '',
            action,
            targetId: targetId?.toString() || '',
            targetType: targetType || '',
            details,
            beforeState,
            afterState,
            ipAddress,
            userAgent: cleanUserAgent,
            previousEntryHash
        });

        // Generate cryptographic hash signature
        const secret = process.env.AUDIT_SECRET_KEY || 'akjob_secret_forensic_salt_2026';
        const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        // Create log record
        await AuditLog.create({
            adminId,
            action,
            targetId,
            targetType,
            details,
            beforeState,
            afterState,
            ipAddress,
            userAgent: cleanUserAgent,
            hash,
            previousEntryHash
        });
    } catch (err) {
        console.error('🚨 [AUDIT SYSTEM FAILURE]:', err.message);
    }
};

/**
 * Audit ledger integrity validator tool.
 * Scans all database logs, recomputes hashes sequentially, and verifies chaining signature.
 * Returns details about any tampering discovered.
 */
export const verifyLedgerIntegrity = async () => {
    try {
        const logs = await AuditLog.find().sort({ createdAt: 1 });
        let expectedPreviousHash = 'GENESIS_HASH';
        const violations = [];

        for (const log of logs) {
            // 1. Verify chaining connection
            if (log.previousEntryHash !== expectedPreviousHash) {
                violations.push({
                    logId: log._id,
                    action: log.action,
                    issue: 'Broken Chain: The previous entry hash reference does not match the actual previous hash.',
                    expected: expectedPreviousHash,
                    actual: log.previousEntryHash
                });
            }

            // 2. Re-compute current hash
            const payload = JSON.stringify({
                adminId: log.adminId?.toString() || '',
                action: log.action,
                targetId: log.targetId?.toString() || '',
                targetType: log.targetType || '',
                details: log.details || '',
                beforeState: log.beforeState || null,
                afterState: log.afterState || null,
                ipAddress: log.ipAddress || '',
                userAgent: log.userAgent || '',
                previousEntryHash: log.previousEntryHash
            });

            const secret = process.env.AUDIT_SECRET_KEY || 'akjob_secret_forensic_salt_2026';
            const computedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex');

            if (log.hash !== computedHash) {
                violations.push({
                    logId: log._id,
                    action: log.action,
                    issue: 'Data Tampered: The hash signature of this entry is invalid. Content has been edited post-write.',
                    expected: computedHash,
                    actual: log.hash
                });
            }

            expectedPreviousHash = log.hash;
        }

        return {
            secure: violations.length === 0,
            totalLogsScanned: logs.length,
            violations
        };
    } catch (error) {
        throw new Error(`Integrity Scan Error: ${error.message}`);
    }
};
