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
    createManualSubscription,
    getPaymentsAdmin,
    getPromoVideo,
    updatePromoVideo,
    uploadPromoVideo,
    deletePromoVideoFromLibrary,
    getCandidateSubscriptionConfig,
    updateCandidateSubscriptionConfig,
    createRecruiterByAdmin,
    getAdminCompanies,
    getRevenueReports,
    getBroadcastHistory,
    createManualAuditLog,
} from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { requireReauth } from '../middlewares/reauthMiddleware.js';
import { adminLimiter } from '../middlewares/rateLimiterMiddleware.js';
import upload from '../config/upload.js';

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
router.put('/users/:id', requireReauth, updateUser);
router.delete('/users/:id', requireReauth, deleteUserAdmin);

// Job moderation
router.get('/jobs', getAllJobsAdmin);
router.delete('/jobs/:id', requireReauth, deleteJobAdmin);

// Application Review (STRICT Mode Verification)
router.get('/applications', getApplicationsAdmin);
router.put('/applications/:id/review', reviewApplicationAdmin);

// Communication
router.post('/broadcast', broadcastNotification);
router.get('/broadcasts/history', getBroadcastHistory);

// Audit logs
router.get('/audit-logs', getAuditLogs);
router.post('/audit-logs/verify', requireReauth, verifyAuditLedger);
router.post('/audit-logs/manual', createManualAuditLog);

// Platform config (Global Settings)
router.get('/platform-config', getPlatformConfig);
router.put('/platform-config', updatePlatformConfig);

// Platform plan (Monetization/Pricing)
router.get('/platform-plan', getPlatformPlanAdmin);
router.put('/platform-plan', updatePlatformPlanAdmin);

// Subscriptions & Payments Ledger
router.get('/subscriptions', getSubscriptionsAdmin);
router.post('/subscriptions', createManualSubscription);
router.get('/payments', getPaymentsAdmin);

// Promo Video
router.get('/promo-video', getPromoVideo);
router.put('/promo-video', updatePromoVideo);
router.post('/promo-video/upload', upload.single('video'), uploadPromoVideo);
router.delete('/promo-video/library/:videoId', deletePromoVideoFromLibrary);

// Candidate Subscription (Admin-Controlled)
router.get('/candidate-subscription', getCandidateSubscriptionConfig);
router.put('/candidate-subscription', updateCandidateSubscriptionConfig);

// Companies / Recruiters (Admin manually add)
router.get('/companies', getAdminCompanies);
router.post('/companies', requireReauth, createRecruiterByAdmin);

// Revenue Reports
router.get('/reports/revenue', getRevenueReports);

export default router;
