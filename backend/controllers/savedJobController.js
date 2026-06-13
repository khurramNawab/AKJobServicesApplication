import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';

// @desc    Toggle save job
// @route   POST /api/v1/saved-jobs/toggle/:jobId
// @access  Private (Candidate only)
export const toggleSavedJob = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user._id;

        const existing = await SavedJob.findOne({ userId, jobId });

        if (existing) {
            await SavedJob.findByIdAndDelete(existing._id);
            return res.status(200).json({
                success: true,
                isSaved: false,
                message: 'Job removed from saved list'
            });
        } else {
            const job = await Job.findById(jobId);
            if (!job) {
                return res.status(404).json({ success: false, message: 'Job not found' });
            }

            await SavedJob.create({ userId, jobId });
            return res.status(201).json({
                success: true,
                isSaved: true,
                message: 'Job saved successfully'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my saved jobs
// @route   GET /api/v1/saved-jobs/me
// @access  Private (Candidate only)
export const getMySavedJobs = async (req, res) => {
    try {
        let savedJobs = await SavedJob.find({ userId: req.user._id })
            .populate({
                path: 'jobId',
                populate: {
                    path: 'recruiterId',
                    select: 'name email'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        // Populate companyName and companyLogo for recruiterId in jobId
        const recruiterUserIds = savedJobs.map(item => item.jobId?.recruiterId?._id).filter(Boolean);
        if (recruiterUserIds.length > 0) {
            const recruiters = await Recruiter.find({ userId: { $in: recruiterUserIds } }).lean();
            const recruiterMap = recruiters.reduce((acc, rec) => {
                acc[rec.userId.toString()] = rec;
                return acc;
            }, {});

            savedJobs = savedJobs.map(item => {
                if (item.jobId && item.jobId.recruiterId) {
                    const info = recruiterMap[item.jobId.recruiterId._id.toString()];
                    if (info) {
                        item.jobId.recruiterId = {
                            _id: item.jobId.recruiterId._id.toString(),
                            name: item.jobId.recruiterId.name,
                            email: item.jobId.recruiterId.email,
                            companyName: info.companyName || 'Company Name',
                            companyLogo: info.companyLogo ? info.companyLogo.replace('http://', 'https://') : ''
                        };
                    } else {
                        item.jobId.recruiterId = {
                            _id: item.jobId.recruiterId._id.toString(),
                            name: item.jobId.recruiterId.name,
                            email: item.jobId.recruiterId.email,
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
            count: savedJobs.length,
            data: savedJobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check if job is saved
// @route   GET /api/v1/saved-jobs/check/:jobId
// @access  Private (Candidate only)
export const checkIfSaved = async (req, res) => {
    try {
        const isSaved = await SavedJob.exists({
            userId: req.user._id,
            jobId: req.params.jobId
        });

        res.status(200).json({
            success: true,
            isSaved: !!isSaved
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
