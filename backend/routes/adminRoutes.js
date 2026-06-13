import express from 'express';
import {
    getStats,
    getAllUsers,
    updateUser,
    deleteJobAdmin,
    deleteUserAdmin,
    getAllJobsAdmin,
    broadcastNotification,
    getAdminActivity,
    getPlatformPlanAdmin,
    updatePlatformPlanAdmin,
    getPlatformConfig,
    updatePlatformConfig,
    getAuditLogs,
    verifyAuditLedger,
    reviewApplicationAdmin,
    getApplicationsAdmin,
    getSubscriptionsAdmin,
    getPaymentsAdmin,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { requireReauth } from '../middlewares/reauthMiddleware.js';
import { adminLimiter } from '../middlewares/rateLimiterMiddleware.js';

const router = express.Router();

// Apply protection to ALL admin routes
router.use(protect);
router.use(authorizeRoles('ADMIN', 'SUPER_ADMIN'));
router.use(adminLimiter);

// Dashboard
router.get('/stats', getStats);
router.get('/activity', getAdminActivity);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', requireReauth, updateUser);   // Updating users (like banning) requires re-auth
router.delete('/users/:id', requireReauth, deleteUserAdmin);

// Job moderation
router.get('/jobs', getAllJobsAdmin);
router.delete('/jobs/:id', requireReauth, deleteJobAdmin);

// Application Review (STRICT Mode Verification)
router.get('/applications', getApplicationsAdmin);
router.put('/applications/:id/review', reviewApplicationAdmin);

// Communication
router.post('/broadcast', broadcastNotification);

// Audit logs
router.get('/audit-logs', getAuditLogs);
router.post('/audit-logs/verify', requireReauth, verifyAuditLedger);

// Platform config (Global Settings)
router.get('/platform-config', getPlatformConfig);
router.put('/platform-config', updatePlatformConfig);

// Platform plan (Monetization/Pricing)
router.get('/platform-plan', getPlatformPlanAdmin);
router.put('/platform-plan', updatePlatformPlanAdmin);

// Subscriptions & Payments Ledger
router.get('/subscriptions', getSubscriptionsAdmin);
router.get('/payments', getPaymentsAdmin);

export default router;
