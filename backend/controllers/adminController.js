import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import PlatformPlan from '../models/PlatformPlan.js';
import AuditLog from '../models/AuditLog.js';
import Recruiter from '../models/Recruiter.js';
import Candidate from '../models/Candidate.js';
import { buildPagination } from '../utils/pagination.js';
import { logAdminAction, verifyLedgerIntegrity } from '../utils/auditLogger.js';
import { notificationQueue } from '../config/queue.js';
import { v2 as cloudinary } from 'cloudinary';

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    try {
        const last7DaysStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalJobs,
            totalApplications,
            totalCandidates,
            totalRecruiters,
            totalRevenue,
            activeSubscriptions,
            pendingPayments,
            newUsersLast7Days,
            newJobsLast7Days,
            newSubscriptionsLast7Days,
            revenueLast7Days,
            paidUsersCount
        ] = await Promise.all([
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
            User.countDocuments({ createdAt: { $gte: last7DaysStart } }),
            Job.countDocuments({ createdAt: { $gte: last7DaysStart } }),
            Subscription.countDocuments({ status: 'ACTIVE', createdAt: { $gte: last7DaysStart } }),
            Payment.aggregate([
                { $match: { status: 'SUCCESS', createdAt: { $gte: last7DaysStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            Payment.distinct('userId', { status: 'SUCCESS' }).then(users => users.length),
        ]);

        const overallRevenue = totalRevenue[0]?.total || 0;
        const recentRevenue = revenueLast7Days[0]?.total || 0;

        // Calculate changes
        const usersPriorTo7Days = totalUsers - newUsersLast7Days;
        const userChangePct = usersPriorTo7Days > 0 ? ((newUsersLast7Days / usersPriorTo7Days) * 100).toFixed(1) : '0';

        const jobsPriorTo7Days = totalJobs - newJobsLast7Days;
        const jobChangePct = jobsPriorTo7Days > 0 ? ((newJobsLast7Days / jobsPriorTo7Days) * 100).toFixed(1) : '0';

        const revenuePriorTo7Days = overallRevenue - recentRevenue;
        const revenueChangePct = revenuePriorTo7Days > 0 ? ((recentRevenue / revenuePriorTo7Days) * 100).toFixed(1) : '0';

        const subscriptionsPriorTo7Days = activeSubscriptions - newSubscriptionsLast7Days;
        const subscriptionChangePct = subscriptionsPriorTo7Days > 0 ? ((newSubscriptionsLast7Days / subscriptionsPriorTo7Days) * 100).toFixed(1) : '0';

        // Conversion rate (Percentage of total registered users who paid)
        const conversionRate = totalUsers > 0 ? ((paidUsersCount / totalUsers) * 100).toFixed(1) : '0.0';

        // Monthly revenue breakdown for the last 7 months
        const sevenMonthsAgo = new Date();
        sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 6);
        sevenMonthsAgo.setDate(1);
        sevenMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenueAgg = await Payment.aggregate([
            {
                $match: {
                    status: 'SUCCESS',
                    createdAt: { $gte: sevenMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const revenueBreakdown = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const m = d.getMonth();
            const y = d.getFullYear();

            const found = monthlyRevenueAgg.find(r => r._id.month === (m + 1) && r._id.year === y);
            const val = found ? found.total : 0;
            revenueBreakdown.push({
                month: monthNames[m],
                val: val,
            });
        }

        // Calculate heights percentages for graph rendering
        const maxVal = Math.max(...revenueBreakdown.map(r => r.val), 0);
        revenueBreakdown.forEach(r => {
            r.pct = maxVal > 0 ? Math.round((r.val / maxVal) * 100) : 0;
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalJobs,
                totalApplications,
                totalCandidates,
                totalRecruiters,
                totalRevenue: overallRevenue,
                activeSubscriptions,
                pendingPayments,
                newUsersLast7Days,
                conversionRate,
                userChangePct,
                jobChangePct,
                revenueChangePct,
                subscriptionChangePct,
                revenueBreakdown
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

        // Custom search to allow searching both name and email
        if (req.query.search) {
            delete query.filter[req.query.searchField]; // delete single-field filter if set by helper
            query.filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const totalDocs = await User.countDocuments(query.filter);
        const users = await User.find(query.filter)
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit)
            .select('-__v');

        const userIds = users.map(u => u._id);
        const [recruiters, candidates] = await Promise.all([
            Recruiter.find({ userId: { $in: userIds } }).select('userId companyLogo companyName'),
            Candidate.find({ userId: { $in: userIds } }).select('userId profilePhoto')
        ]);

        const recruiterMap = new Map(recruiters.map(r => [r.userId.toString(), r]));
        const candidateMap = new Map(candidates.map(c => [c.userId.toString(), c]));

        const dataWithPhotos = users.map(u => {
            const userObj = u.toObject();
            if (u.role === 'RECRUITER') {
                const rec = recruiterMap.get(u._id.toString());
                userObj.companyLogo = rec ? rec.companyLogo : '';
                userObj.companyName = rec ? rec.companyName : '';
            } else if (u.role === 'CANDIDATE') {
                const cand = candidateMap.get(u._id.toString());
                userObj.profilePhoto = cand ? cand.profilePhoto : '';
            }
            return userObj;
        });

        res.status(200).json({
            success: true,
            count: users.length,
            ...pagination(totalDocs),
            data: dataWithPhotos,
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
            .populate('recruiterId', 'name email')
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit);

        // Fetch associated Recruiter profiles to get companyLogo and companyName
        const recruiterUserIds = jobs.map(j => j.recruiterId?._id).filter(Boolean);
        const recruiters = await Recruiter.find({ userId: { $in: recruiterUserIds } }).select('userId companyLogo companyName');
        const recruiterMap = new Map(recruiters.map(r => [r.userId.toString(), r]));

        const enrichedJobs = jobs.map(job => {
            const jobObj = job.toObject();
            if (jobObj.recruiterId) {
                const profile = recruiterMap.get(jobObj.recruiterId._id.toString());
                if (profile) {
                    jobObj.recruiterId.companyLogo = profile.companyLogo;
                    jobObj.recruiterId.companyName = profile.companyName;
                }
            }
            return jobObj;
        });

        res.status(200).json({
            success: true,
            count: enrichedJobs.length,
            ...pagination(totalDocs),
            data: enrichedJobs,
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

        // Offload dynamic mass broadcast delivery safely to notificationQueue in BullMQ
        await notificationQueue.add('broadcastNotification', {
            title,
            message,
            isBroadcast: true,
            adminId: req.user._id,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });

        res.status(202).json({
            success: true,
            message: 'Broadcast notification successfully queued for dynamic background delivery.',
        });
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

// @desc    Verify cryptographic ledger integrity for admin activities
// @route   POST /api/v1/admin/audit-logs/verify
// @access  Private/Admin
export const verifyAuditLedger = async (req, res) => {
    try {
        const result = await verifyLedgerIntegrity();
        res.status(200).json({
            success: true,
            data: result
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

// @desc    Get all subscriptions
// @route   GET /api/v1/admin/subscriptions
// @access  Private/Admin
export const getSubscriptionsAdmin = async (req, res) => {
    try {
        const subscriptions = await Subscription.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        const formatted = subscriptions.map(sub => ({
            _id: sub._id,
            user: {
                name: sub.userId?.name || 'Unknown User',
                email: sub.userId?.email || ''
            },
            plan: sub.planType,
            status: sub.status,
            startDate: sub.startDate,
            endDate: sub.endDate,
            amount: sub.planType === 'PRO' ? 999 : sub.planType === 'ELITE' ? 2499 : 0
        }));

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin manually creates a subscription
// @route   POST /api/v1/admin/subscriptions
// @access  Private/Admin
export const createManualSubscription = async (req, res) => {
    try {
        const { userEmail, planType, durationMonths, amount } = req.body;

        if (!userEmail || !planType || !durationMonths) {
            return res.status(400).json({ success: false, message: 'User email, Plan type, and Duration are required' });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this email' });
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(startDate.getMonth() + parseInt(durationMonths, 10));

        // Create subscription entry
        const subscription = await Subscription.create({
            userId: user._id,
            planType,
            status: 'ACTIVE',
            startDate,
            endDate
        });

        // Update User model fields
        user.planType = planType;
        user.subscriptionStart = startDate;
        user.subscriptionEnd = endDate;
        user.isActive = true;
        await user.save();

        // Create a mock successful Payment record for the ledger
        await Payment.create({
            userId: user._id,
            amount: amount || 0,
            status: 'SUCCESS',
            transactionId: `TXN-MANUAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            orderId: `ORDER-MANUAL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            paymentMethod: 'MANUAL'
        });

        logAdminAction(req, 'SUBSCRIPTION_CREATE', {
            targetId: subscription._id,
            targetType: 'Subscription',
            details: `Admin manually added ${planType} subscription for user: ${user.email} for ${durationMonths} months (Amount: ₹${amount})`,
        });

        res.status(201).json({
            success: true,
            message: 'Manual subscription created successfully!',
            data: subscription
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payments
// @route   GET /api/v1/admin/payments
// @access  Private/Admin
export const getPaymentsAdmin = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('userId', 'name email planType')
            .sort({ createdAt: -1 });

        const formatted = payments.map(pay => ({
            id: pay.transactionId || pay.orderId,
            user: pay.userId?.name || 'Unknown User',
            plan: pay.userId?.planType || (pay.amount === 999 ? 'PRO' : pay.amount === 2499 ? 'ELITE' : 'BASIC'),
            amount: pay.amount,
            status: pay.status,
            date: pay.createdAt.toISOString().split('T')[0]
        }));

        res.status(200).json({
            success: true,
            count: formatted.length,
            data: formatted
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ═══════════════════════════════════════════════════════════════════
//  PROMO VIDEO MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

// @desc    Get promo video config
// @route   GET /api/v1/admin/promo-video
// @access  Private/Admin
export const getPromoVideo = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) config = await PlatformConfig.create({});
        res.status(200).json({ success: true, data: { ...config.promoVideo.toObject(), library: config.promoVideoLibrary, descriptions: config.promoVideoDescriptions } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update promo video config
// @route   PUT /api/v1/admin/promo-video
// @access  Private/Admin
export const updatePromoVideo = async (req, res) => {
    try {
        const ALLOWED = ['url', 'cloudinaryUrl', 'title', 'description', 'isActive', 'isMuted'];
        const promoVideoUpdate = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) promoVideoUpdate[`promoVideo.${key}`] = req.body[key];
        }

        if (req.body.descriptions !== undefined) {
            promoVideoUpdate['promoVideoDescriptions'] = req.body.descriptions;
        }

        const config = await PlatformConfig.findOneAndUpdate(
            {},
            promoVideoUpdate,
            { new: true, upsert: true }
        );

        logAdminAction(req, 'SETTINGS_UPDATE', {
            targetType: 'System',
            details: 'Updated promo video settings',
        });

        res.status(200).json({ success: true, data: { ...config.promoVideo.toObject(), library: config.promoVideoLibrary, descriptions: config.promoVideoDescriptions } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const uploadPromoVideo = async (req, res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ success: false, message: 'Please upload a video file.' });
        }

        const newVideo = {
            url: req.file.path,
            publicId: req.file.cloudinary_public_id || '',
            title: req.body.title || 'Uploaded Video',
            uploadedAt: new Date()
        };

        const config = await PlatformConfig.findOneAndUpdate(
            {},
            { $push: { promoVideoLibrary: newVideo } },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Video uploaded successfully to Cloudinary and added to library!',
            url: req.file.path,
            data: { ...config.promoVideo.toObject(), library: config.promoVideoLibrary, descriptions: config.promoVideoDescriptions }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete promo video from library
// @route   DELETE /api/v1/admin/promo-video/library/:videoId
// @access  Private/Admin
export const deletePromoVideoFromLibrary = async (req, res) => {
    try {
        const { videoId } = req.params;
        const config = await PlatformConfig.findOne();
        if (!config) return res.status(404).json({ success: false, message: 'Config not found' });

        const video = config.promoVideoLibrary.id(videoId);
        if (!video) return res.status(404).json({ success: false, message: 'Video not found in library' });

        // Hard delete from Cloudinary if publicId exists
        if (video.publicId) {
            try {
                await cloudinary.uploader.destroy(video.publicId, { resource_type: "video" });
            } catch (cloudErr) {
                console.error("Failed to delete video from Cloudinary:", cloudErr);
                // Continue with DB deletion even if Cloudinary fails
            }
        }

        // Clear active video if it matches the deleted one
        if (config.promoVideo.cloudinaryUrl === video.url) {
            config.promoVideo.cloudinaryUrl = '';
            if (!config.promoVideo.url) {
                config.promoVideo.isActive = false;
            }
        }

        config.promoVideoLibrary.pull(videoId);
        await config.save();

        res.status(200).json({ 
            success: true, 
            message: 'Video removed from library',
            data: { ...config.promoVideo.toObject(), library: config.promoVideoLibrary, descriptions: config.promoVideoDescriptions }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  CANDIDATE SUBSCRIPTION CONFIG
// ═══════════════════════════════════════════════════════════════════

// @desc    Get candidate subscription config
// @route   GET /api/v1/admin/candidate-subscription
// @access  Private/Admin
export const getCandidateSubscriptionConfig = async (req, res) => {
    try {
        let config = await PlatformConfig.findOne();
        if (!config) config = await PlatformConfig.create({});
        res.status(200).json({
            success: true,
            data: {
                candidateSubscriptionEnabled: config.candidateSubscriptionEnabled,
                candidateBasicMonthly: config.candidateBasicMonthly,
                candidateBasicYearly: config.candidateBasicYearly,
                candidatePremiumMonthly: config.candidatePremiumMonthly,
                candidatePremiumYearly: config.candidatePremiumYearly,
                candidateFreeApplicationLimit: config.candidateFreeApplicationLimit,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update candidate subscription config
// @route   PUT /api/v1/admin/candidate-subscription
// @access  Private/Admin
export const updateCandidateSubscriptionConfig = async (req, res) => {
    try {
        const ALLOWED = [
            'candidateSubscriptionEnabled',
            'candidateBasicMonthly', 'candidateBasicYearly',
            'candidatePremiumMonthly', 'candidatePremiumYearly',
            'candidateFreeApplicationLimit'
        ];
        const updates = {};
        for (const key of ALLOWED) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        const config = await PlatformConfig.findOneAndUpdate(
            {},
            updates,
            { new: true, upsert: true }
        );

        logAdminAction(req, 'SETTINGS_UPDATE', {
            targetType: 'System',
            details: `Updated candidate subscription config: ${Object.keys(updates).join(', ')}`,
        });

        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  ADMIN: CREATE RECRUITER / COMPANY MANUALLY
// ═══════════════════════════════════════════════════════════════════



// @desc    Admin manually creates a recruiter account + company profile
// @route   POST /api/v1/admin/companies
// @access  Private/Admin
export const createRecruiterByAdmin = async (req, res) => {
    try {
        const { 
            name, email, password, companyName, phone, companyAddress, website, gstNumber,
            companyLogo, companyPhotos, description, industry, location, foundedDate, companyType, designation
        } = req.body;

        if (!name || !email || !password || !companyName) {
            return res.status(400).json({ success: false, message: 'Name, Email, Password and Company Name are required' });
        }

        // Check if user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'A user with this email already exists' });
        }

        // Create User (auto-verified by admin)
        const user = await User.create({
            name,
            email,
            password,
            role: 'RECRUITER',
            isVerified: true,   // Admin-created accounts are pre-verified
            isActive: true,
        });

        // Parse photos if supplied
        const photosArray = companyPhotos && Array.isArray(companyPhotos)
            ? companyPhotos.map(url => ({ url, size: 1024 }))
            : [];

        // Create Recruiter profile
        await Recruiter.create({
            userId: user._id,
            companyName,
            companyAddress: companyAddress || '',
            website: website || '',
            gstNumber: gstNumber || '',
            companyLogo: companyLogo || '',
            companyPhotos: photosArray,
            description: description || '',
            industry: industry || '',
            location: location || '',
            foundedDate: foundedDate || '',
            companyType: companyType || '',
            designation: designation || '',
        });

        logAdminAction(req, 'USER_CREATE', {
            targetId: user._id,
            targetType: 'User',
            details: `Admin created recruiter: ${name} (${email}) for company: ${companyName}`,
        });

        res.status(201).json({
            success: true,
            message: `Recruiter account created successfully for ${companyName}`,
            data: { userId: user._id, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all companies/recruiters for admin
// @route   GET /api/v1/admin/companies
// @access  Private/Admin
export const getAdminCompanies = async (req, res) => {
    try {
        const { query, pagination } = buildPagination(req.query);

        if (req.query.search) {
            query.filter.$or = [
                { companyName: { $regex: req.query.search, $options: 'i' } },
            ];
        }

        const totalDocs = await Recruiter.countDocuments(query.filter);
        const companies = await Recruiter.find(query.filter)
            .populate('userId', 'name email isVerified isBanned planType createdAt')
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit);

        res.status(200).json({
            success: true,
            count: companies.length,
            ...pagination(totalDocs),
            data: companies,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ═══════════════════════════════════════════════════════════════════
//  REVENUE REPORTS
// ═══════════════════════════════════════════════════════════════════

// @desc    Get daily revenue for last 30 days
// @route   GET /api/v1/admin/reports/revenue
// @access  Private/Admin
export const getRevenueReports = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const revenueByDay = await Payment.aggregate([
            { $match: { status: 'SUCCESS', createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        const filledData = [];
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = revenueByDay.find(r => r._id === dateStr);
            filledData.push({
                date: dateStr,
                total: found ? found.total : 0,
                count: found ? found.count : 0,
            });
        }

        // Broadcast history for last 10 broadcasts
        const recentBroadcasts = await Notification.find({ isBroadcast: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('title message createdAt');

        res.status(200).json({
            success: true,
            data: { revenueByDay: filledData, recentBroadcasts }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recent broadcast history
// @route   GET /api/v1/admin/broadcasts/history
// @access  Private/Admin
export const getBroadcastHistory = async (req, res) => {
    try {
        const broadcasts = await Notification.find({ isBroadcast: true })
            .sort({ createdAt: -1 })
            .limit(20)
            .select('title message createdAt');

        res.status(200).json({ success: true, data: broadcasts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create manual audit log entry
// @route   POST /api/v1/admin/audit-logs/manual
// @access  Private/Admin
export const createManualAuditLog = async (req, res) => {
    try {
        const { details } = req.body;
        if (!details || details.trim() === '') {
            return res.status(400).json({ success: false, message: 'Details log content is required' });
        }
        
        await logAdminAction(req, 'OTHER', {
            targetType: 'System',
            details: `Manual Entry: ${details}`
        });

        res.status(201).json({
            success: true,
            message: 'Manual entry successfully committed to system audit ledger'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
