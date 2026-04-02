import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import PlatformPlan from '../models/PlatformPlan.js';

// @desc    Get dashboard statistics
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalJobs = await Job.countDocuments();
        const totalApplications = await Application.countDocuments();
        const totalCandidates = await User.countDocuments({ role: 'CANDIDATE' });
        const totalRecruiters = await User.countDocuments({ role: 'RECRUITER' });

        // Enterprise Metrics
        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'SUCCESS' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeSubscriptions = await Subscription.countDocuments({ status: 'ACTIVE' });
        const pendingPayments = await Payment.countDocuments({ status: 'PENDING' });

        // Growth stats (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

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
                newUsersLast7Days
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user status/role
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete job (Admin moderation)
// @route   DELETE /api/v1/admin/jobs/:id
// @access  Private/Admin
export const deleteJobAdmin = async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all jobs for moderation
// @route   GET /api/v1/admin/jobs
// @access  Private/Admin
export const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find().populate('recruiter', 'name companyName').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user account
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUserAdmin = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User account deleted permanently' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Broadcast notification to all users
// @route   POST /api/v1/admin/broadcast
// @access  Private/Admin
export const broadcastNotification = async (req, res) => {
    try {
        const { title, message } = req.body;
        
        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Please provide title and message' });
        }

        const users = await User.find().select('_id');
        
        // Simple loop broadcast (For large scale, use a background worker like BullMQ)
        const notifications = users.map(user => ({
            userId: user._id,
            title,
            message,
            type: 'SYSTEM'
        }));

        await Notification.insertMany(notifications);

        res.status(200).json({ 
            success: true, 
            message: `Broadcast sent successfully to ${users.length} users` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recent platform activity
// @route   GET /api/v1/admin/activity
// @access  Private/Admin
export const getAdminActivity = async (req, res) => {
    try {
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
        const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).select('title companyName createdAt');

        const activity = [
            ...recentUsers.map(u => ({ type: 'USER_JOINED', detail: `${u.name} (${u.role})`, time: u.createdAt })),
            ...recentJobs.map(j => ({ type: 'JOB_POSTED', detail: `${j.title} at ${j.companyName}`, time: j.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.status(200).json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get platform plan configuration
// @route   GET /api/v1/admin/platform-plan
// @access  Private/Admin
export const getPlatformPlan = async (req, res) => {
    try {
        let config = await PlatformPlan.findOne();
        if (!config) config = await PlatformPlan.create({});
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update platform plan configuration
// @route   PUT /api/v1/admin/platform-plan
// @access  Private/Admin
export const updatePlatformPlan = async (req, res) => {
    try {
        const config = await PlatformPlan.findOneAndUpdate(
            {},
            { ...req.body, lastUpdatedBy: req.user._id },
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
