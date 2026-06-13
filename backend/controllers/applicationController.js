import Application from '../models/Application.js';
import Job from '../models/Job.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notification.js';
import PlatformConfig from '../models/PlatformConfig.js';
import { invalidateCache } from '../utils/cache.js';
import Recruiter from '../models/Recruiter.js';

// @desc    Apply for a job (Production-Hardened)
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Private (Candidate only)
export const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user._id;

        // 1. Validate Job Existence
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ 
                success: false, 
                message: "Job not found" 
            });
        }

        // Check if Job is Closed
        if (job.status === 'CLOSED') {
            return res.status(400).json({
                success: false,
                message: "This job posting has been closed by the recruiter."
            });
        }

        // 2. Validate User Existence & Profile
        const Candidate = mongoose.model('Candidate');
        const candidateProfile = await Candidate.findOne({ userId });

        if (!candidateProfile) {
            return res.status(403).json({ 
                success: false, 
                message: "Incomplete Profile. Please complete your candidate profile before applying." 
            });
        }

        // 3. Prevent Duplicate Applications
        const alreadyApplied = await Application.findOne({ 
            jobId: job._id, 
            candidateId: userId 
        });

        if (alreadyApplied) {
            return res.status(400).json({ 
                success: false, 
                message: "You have already applied for this position" 
            });
        }

        // 4. Retrieve Resume (Body > Profile)
        const finalResume = req.body?.resume || candidateProfile.resumeUrl;
        if (!finalResume) {
            return res.status(400).json({ 
                success: false, 
                message: "Resume Required. Please upload a resume to your profile first." 
            });
        }

        // 5. Create Application (No transactions for local stability)
        const application = await Application.create({
            jobId: job._id,
            candidateId: userId,
            recruiterId: job.recruiterId,
            resume: finalResume,
            coverLetter: req.body?.coverLetter || '',
            status: 'APPLIED',
            statusHistory: [{ status: 'APPLIED', timestamp: new Date() }]
        });

        // 6. Update Job Metrics
        await Job.updateOne({ _id: job._id }, { $inc: { applicantsCount: 1 } });
        
        // Invalidate cached job details and list
        await invalidateCache(`jobs:detail:${job._id}`).catch(err => console.error('Cache Inval Error:', err));
        await invalidateCache('jobs:list:*').catch(err => console.error('Cache Inval Error:', err));

        // 7. Notification (Non-blocking)
        createNotification(
            job.recruiterId,
            'New Application',
            `A new candidate has applied for: ${job.title}`,
            'APPLICATION_STATUS',
            { jobId: job._id, applicationId: application._id }
        ).catch(err => console.error('Notification Error:', err));

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: application
        });

    } catch (error) {
        console.error('[ApplicationController] Apply Job Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error during application process" 
        });
    }
};


// @desc    Get user's applications
// @route   GET /api/v1/applications/me
// @access  Private (Candidate only)
export const getMyApplications = async (req, res) => {
    try {
        let applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title location type recruiterId')
            .lean();

        // Populate companyName and companyLogo for recruiterId in jobId
        const recruiterUserIds = applications.map(item => item.jobId?.recruiterId).filter(Boolean);
        if (recruiterUserIds.length > 0) {
            const recruiters = await Recruiter.find({ userId: { $in: recruiterUserIds } }).lean();
            const recruiterMap = recruiters.reduce((acc, rec) => {
                acc[rec.userId.toString()] = rec;
                return acc;
            }, {});

            applications = applications.map(item => {
                if (item.jobId && item.jobId.recruiterId) {
                    const info = recruiterMap[item.jobId.recruiterId.toString()];
                    if (info) {
                        item.jobId.recruiterId = {
                            _id: item.jobId.recruiterId.toString(),
                            companyName: info.companyName || 'Company Name',
                            companyLogo: info.companyLogo ? info.companyLogo.replace('http://', 'https://') : ''
                        };
                    } else {
                        item.jobId.recruiterId = {
                            _id: item.jobId.recruiterId.toString(),
                            companyName: 'Company Name',
                            companyLogo: ''
                        };
                    }
                }
                return item;
            });
        }

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check if candidate has already applied
// @route   GET /api/v1/applications/check/:jobId
// @access  Private (Candidate only)
export const checkApplicationStatus = async (req, res) => {
    try {
        const applicationId = await Application.exists({
            jobId: req.params.jobId,
            candidateId: req.user._id
        });

        res.status(200).json({
            success: true,
            hasApplied: !!applicationId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get applicants for a specific job
// @route   GET /api/v1/applications/job/:jobId
// @access  Private (Recruiter only)
export const getJobApplicants = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure job belongs to this recruiter
        const recruiterIdStr = job.recruiterId.toString();
        const userIdStr = req.user._id.toString();

        if (recruiterIdStr !== userIdStr && req.user.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to view applicants for this job',
                debug: { recruiterIdStr, userIdStr, role: req.user.role }
            });
        }

        const applicants = await Application.aggregate([
            { $match: { jobId: new mongoose.Types.ObjectId(jobId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'candidateId',
                    foreignField: '_id',
                    as: 'candidateUser'
                }
            },
            { $unwind: '$candidateUser' },
            {
                $lookup: {
                    from: 'candidates',
                    localField: 'candidateId',
                    foreignField: 'userId',
                    as: 'candidateProfile'
                }
            },
            { $unwind: { path: '$candidateProfile', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    createdAt: 1,
                    candidateId: {
                        _id: '$candidateUser._id',
                        name: '$candidateUser.name',
                        role: '$candidateUser.role',
                        avatar: '$candidateUser.avatar'
                    },

                    profile: '$candidateProfile'
                }
            }
        ]);



        res.status(200).json({
            success: true,
            data: applicants
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update application status
// @route   PUT /api/v1/applications/:id/status
// @access  Private (Recruiter only)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify job belongs to recruiter
        const job = await Job.findById(application.jobId);
        if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this status' });
        }

        application.status = status;
        application.statusHistory.push({ status, timestamp: new Date() });
        await application.save();

        // Send notification to candidate
        let notificationTitle = 'Application Status Update';
        let notificationMessage = `Your application for ${job.title} status has been updated to: ${status}`;

        if (status === 'SHORTLISTED') {
            notificationTitle = 'Congratulations! You are Shortlisted';
            notificationMessage = `Great news! You have been shortlisted for the ${job.title} position at ${job.recruiterId?.companyName || 'the company'}. Expected a follow-up soon.`;
        } else if (status === 'REJECTED') {
            notificationTitle = 'Application Status: Not Selected';
            notificationMessage = `Thank you for your interest in the ${job.title} position. After careful review, the company has decided not to proceed with your application at this time.`;
        } else if (status === 'HIRED') {
            notificationTitle = 'Offer Insight: You are Hired!';
            notificationMessage = `We are thrilled to inform you that you have been hired for the ${job.title} position! The recruiter will contact you regarding the next steps.`;
        } else if (status === 'REVIEWING') {
            notificationTitle = 'Application Under Review';
            notificationMessage = `Your application for ${job.title} is now under review by the hiring team.`;
        }

        await createNotification(
            application.candidateId,
            notificationTitle,
            notificationMessage,
            'APPLICATION_STATUS',
            { jobId: job._id, applicationId: application._id, status }
        );

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
