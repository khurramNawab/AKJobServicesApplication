import mongoose from 'mongoose';

/**
 * Admin Audit Log — tracks every admin action for accountability.
 * Auto-expires after 90 days via TTL index.
 */
const auditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: [
            'USER_UPDATE', 'USER_DELETE', 'USER_BAN', 'USER_UNBAN',
            'JOB_DELETE', 'JOB_APPROVE', 'JOB_REJECT',
            'BROADCAST_SENT', 'PLATFORM_PLAN_UPDATE',
            'ROLE_CHANGE', 'ADMIN_LOGIN', 'ADMIN_LOGOUT',
            'SETTINGS_UPDATE', 'OTHER'
        ],
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    targetType: {
        type: String,
        enum: ['User', 'Job', 'Application', 'Payment', 'System', null],
        default: null,
    },
    details: {
        type: String,
        default: '',
    },
    ipAddress: {
        type: String,
        default: '',
    },
    userAgent: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Quick lookup by admin
auditLogSchema.index({ adminId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
