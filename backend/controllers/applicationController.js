import Application from '../models/Application.js';
import Job from '../models/Job.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notification.js';

// @desc    Apply for a job
// @route   POST /api/v1/jobs/:jobId/apply
// @access  Private (Candidate only)
export const applyForJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        console.log(`[APPLY] User ${req.user._id} attempting to apply for job ${jobId}`);

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Prepare application data
        const applicationData = {
            jobId,
            candidateId: req.user._id,
            coverLetter: req.body.coverLetter || ''
        };

        // Attempt to create application (will throw error if duplicate due to schema index)
        const application = await Application.create(applicationData);

        // Update Job applicants count
        job.applicantsCount = (job.applicantsCount || 0) + 1;
        await job.save();

        // Send notification to recruiter
        await createNotification(
            job.recruiterId,
            'New Application',
            `A candidate has applied for your job: ${job.title}`,
            'APPLICATION_STATUS',
            { jobId: job._id, applicationId: application._id }
        );

        res.status(201).json({
            success: true,
            message: 'Successfully applied to job!',
            data: application
        });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error code
            return res.status(400).json({ success: false, message: 'You have already applied for this job' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user's applications
// @route   GET /api/v1/applications/me
// @access  Private (Candidate only)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ candidateId: req.user._id })
            .populate('jobId', 'title location type recruiterId');
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

        // Make sure job belongs to this recruiter
        if (job.recruiterId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
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
                        email: '$candidateUser.email',
                        role: '$candidateUser.role'
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
        await application.save();

        // Send notification to candidate
        await createNotification(
            application.candidateId,
            'Application Updated',
            `Your application for ${job.title} status has been updated to: ${status}`,
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
