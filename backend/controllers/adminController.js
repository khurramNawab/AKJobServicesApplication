import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import PlatformPlan from '../models/PlatformPlan.js';
import AuditLog from '../models/AuditLog.js';
import { buildPagination } from '../utils/pagination.js';
import { logAdminAction } from '../utils/auditLogger.js';

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    try {
        const [totalUsers, totalJobs, totalApplications, totalCandidates, totalRecruiters, totalRevenue, activeSubscriptions, pendingPayments, newUsersLast7Days] =
            await Promise.all([
                User.countDocuments(),
                Job.countDocuments(),
                Application.countDocuments(),
                User.countDocuments({ role: 'CANDIDATE' }),
                User.countDocuments({ role: 'RECRUITER' }),
                Payment.aggregate([
                    { $match: { status: 'SUCCESS' } },
                    { $group: { _id: null, total: { $sum: '$amount' } } },
                ]),
                Subscription.countDocuments({ status: 'ACTIVE' }),
                Payment.countDocuments({ status: 'PENDING' }),
                User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
            ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalJobs,
                totalApplications,
                totalCandidates,
                totalRecruiters,
                totalRevenue: totalRevenue[0]?.total || 0,
                activeSubscriptions,
                pendingPayments,
                newUsersLast7Days,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  USER MANAGEMENT — with pagination & mass-assignment protection
// ═══════════════════════════════════════════════════════════════════

// @desc    Get all users (paginated, searchable)
// @route   GET /api/v1/admin/users?page=1&limit=20&search=john&searchField=name
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const { query, pagination } = buildPagination(req.query);

        // Allow filtering by role
        if (req.query.role) {
            query.filter.role = req.query.role;
        }

        const totalDocs = await User.countDocuments(query.filter);
        const users = await User.find(query.filter)
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit)
            .select('-__v');

        res.status(200).json({
            success: true,
            count: users.length,
            ...pagination(totalDocs),
            data: users,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user — ONLY allowed fields (prevents mass assignment)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        // Whitelist: only these fields can be updated by admin
        const ALLOWED_FIELDS = ['role', 'isVerified', 'isBanned', 'banReason'];
        const updates = {};

        for (const field of ALLOWED_FIELDS) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields to update' });
        }

        const user = await User.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Audit
        logAdminAction(req, updates.isBanned !== undefined ? (updates.isBanned ? 'USER_BAN' : 'USER_UNBAN') : 'USER_UPDATE', {
            targetId: user._id,
            targetType: 'User',
            details: `Updated fields: ${Object.keys(updates).join(', ')}`,
        });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUserAdmin = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        logAdminAction(req, 'USER_DELETE', {
            targetId: user._id,
            targetType: 'User',
            details: `Deleted user: ${user.name} (${user.email})`,
        });

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  JOB MANAGEMENT — with pagination
// ═══════════════════════════════════════════════════════════════════

// @desc    Get all jobs (paginated)
// @route   GET /api/v1/admin/jobs?page=1&limit=20
// @access  Private/Admin
export const getAllJobsAdmin = async (req, res) => {
    try {
        const { query, pagination } = buildPagination(req.query);

        if (req.query.status) {
            query.filter.status = req.query.status;
        }

        const totalDocs = await Job.countDocuments(query.filter);
        const jobs = await Job.find(query.filter)
            .populate('recruiterId', 'name')
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit);

        res.status(200).json({
            success: true,
            count: jobs.length,
            ...pagination(totalDocs),
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/v1/admin/jobs/:id
// @access  Private/Admin
export const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        logAdminAction(req, 'JOB_DELETE', {
            targetId: job._id,
            targetType: 'Job',
            details: `Deleted job: ${job.title}`,
        });

        res.status(200).json({ success: true, message: 'Job deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  BROADCAST
// ═══════════════════════════════════════════════════════════════════

// @desc    Broadcast notification (paginated insert for memory safety)
// @route   POST /api/v1/admin/broadcast
// @access  Private/Admin
export const broadcastNotification = async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message required' });
        }

        // Batch insert — 500 at a time to avoid memory spikes
        const BATCH_SIZE = 500;
        let skip = 0;
        let totalSent = 0;

        while (true) {
            const users = await User.find().select('_id').skip(skip).limit(BATCH_SIZE).lean();
            if (users.length === 0) break;

            const notifications = users.map(u => ({
                userId: u._id,
                title,
                message,
                type: 'SYSTEM',
            }));

            await Notification.insertMany(notifications);
            totalSent += users.length;
            skip += BATCH_SIZE;
        }

        logAdminAction(req, 'BROADCAST_SENT', {
            targetType: 'System',
            details: `Broadcast "${title}" sent to ${totalSent} users`,
        });

        res.status(200).json({ success: true, message: `Broadcast sent to ${totalSent} users` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  ACTIVITY & AUDIT
// ═══════════════════════════════════════════════════════════════════

// @desc    Get recent platform activity
// @route   GET /api/v1/admin/activity
// @access  Private/Admin
export const getAdminActivity = async (req, res) => {
    try {
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('title companyName createdAt');

        const activity = [
            ...recentUsers.map(u => ({ type: 'USER_JOINED', detail: `${u.name} (${u.role})`, time: u.createdAt })),
            ...recentJobs.map(j => ({ type: 'JOB_POSTED', detail: `${j.title} at ${j.companyName}`, time: j.createdAt })),
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.status(200).json({ success: true, data: activity });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get admin audit logs (paginated)
// @route   GET /api/v1/admin/audit-logs?page=1&limit=20
// @access  Private/Admin
export const getAuditLogs = async (req, res) => {
    try {
        const { query, pagination } = buildPagination(req.query);

        if (req.query.action) {
            query.filter.action = req.query.action;
        }

        const totalDocs = await AuditLog.countDocuments(query.filter);
        const logs = await AuditLog.find(query.filter)
            .populate('adminId', 'name email')
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit);

        res.status(200).json({
            success: true,
            count: logs.length,
            ...pagination(totalDocs),
            data: logs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import PlatformConfig from '../models/PlatformConfig.js';

// ═══════════════════════════════════════════════════════════════════
//  APPLICATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// @desc    Get all applications (with status filtering)
// @route   GET /api/v1/admin/applications
// @access  Private/Admin
export const getApplicationsAdmin = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const applications = await Application.find(filter)
            .populate('candidateId', 'name email')
            .populate('jobId', 'title companyName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: applications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject pending application (Admin only)
// @route   PUT /api/v1/admin/applications/:id/review
// @access  Private/Admin
export const reviewApplicationAdmin = async (req, res) => {
    try {
        const { status, remarks } = req.body; // status: 'APPROVED' or 'REJECTED'
        
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = status === 'APPROVED' ? 'APPLIED' : 'REJECTED';
        application.reviewedByAdmin = true;
        application.statusHistory.push({ status: application.status, timestamp: new Date() });
        
        await application.save();

        // If APPROVED, notify Recruiter and Candidate
        if (status === 'APPROVED') {
            await Notification.create({
                userId: application.recruiterId,
                title: 'New Application Verified',
                message: `An application for your job has been verified by the admin.`,
                type: 'APPLICATION_STATUS',
                relatedId: application._id
            });
        }

        logAdminAction(req, 'JOB_APPROVE', {
            targetId: application._id,
            targetType: 'Application',
            details: `Admin ${status} application. Remarks: ${remarks || 'none'}`
        });

        res.status(200).json({ success: true, message: `Application ${status} successfully`, data: application });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM CONFIG — mass-assignment safe
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
//  PLATFORM PLAN & MONETIZATION
// ═══════════════════════════════════════════════════════════════════

// @desc    Get platform plan config
// @route   GET /api/v1/admin/platform-plan
// @access  Private/Admin
export const getPlatformPlanAdmin = async (req, res) => {
    try {
        let plan = await PlatformPlan.findOne();
        if (!plan) plan = await PlatformPlan.create({});
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update platform plan config
// @route   PUT /api/v1/admin/platform-plan
// @access  Private/Admin
export const updatePlatformPlanAdmin = async (req, res) => {
    try {
        // Whitelist ALL fields from the model
        const ALLOWED = [
            'freeTierEnabled', 'freeTierExpiryDate', 'freeTierJobApplicationLimit', 'freeTierJobPostLimit',
            'proEnabled', 'proMonthlyPrice', 'proYearlyPrice', 'proJobApplicationLimit',
            'eliteEnabled', 'eliteMonthlyPrice', 'eliteYearlyPrice',
            'platformMode'
        ];
        
        const updates = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const plan = await PlatformPlan.findOneAndUpdate(
            {},
            { ...updates, lastUpdatedBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );

        logAdminAction(req, 'SETTINGS_UPDATE', {
            targetType: 'System',
            details: `Updated platform plan settings: ${Object.keys(updates).join(', ')}`,
        });

        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get platform config (Global Settings)
// @route   GET /api/v1/admin/platform-config
// @access  Private/Admin
export const getPlatformConfig = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) config = await PlatformConfig.create({});
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update platform config (Global Settings)
// @route   PUT /api/v1/admin/platform-config
// @access  Private/Admin
export const updatePlatformConfig = async (req, res) => {
    try {
        const ALLOWED = ['subscriptionEnabled', 'freeMode', 'candidateMessagingMode'];
        const updates = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const config = await PlatformConfig.findOneAndUpdate(
            {},
            updates,
            { new: true, upsert: true, runValidators: true }
        );

        logAdminAction(req, 'SETTINGS_UPDATE', {
            targetType: 'System',
            details: `Updated global platform settings: ${Object.keys(updates).join(', ')}`,
        });

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

