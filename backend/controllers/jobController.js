import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        let jobs = await Job.find().populate('recruiterId', 'name email').sort({ createdAt: -1 }).lean();

        const recruiterUserIds = jobs.map(job => job.recruiterId?._id).filter(Boolean);
        const recruiters = await Recruiter.find({ userId: { $in: recruiterUserIds } });
        const recruiterMap = recruiters.reduce((acc, rec) => {
            acc[rec.userId.toString()] = rec;
            return acc;
        }, {});

        jobs = jobs.map(job => {
            if (job.recruiterId) {
                const recruiterInfo = recruiterMap[job.recruiterId._id.toString()];
                if (recruiterInfo) {
                    job.recruiterId.companyName = recruiterInfo.companyName;
                    job.recruiterId.companyLogo = recruiterInfo.companyLogo;
                }
            }
            return job;
        });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id).populate('recruiterId', 'name email').lean();

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.recruiterId) {
            const recruiterInfo = await Recruiter.findOne({ userId: job.recruiterId._id });
            if (recruiterInfo) {
                job.recruiterId.companyName = recruiterInfo.companyName;
                job.recruiterId.companyLogo = recruiterInfo.companyLogo;
            }
        }

        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private (Recruiter only)
export const createJob = async (req, res) => {
    try {
        // Add user to req.body
        req.body.recruiterId = req.user._id;

        const jobDoc = await Job.create(req.body);
        let job = await jobDoc.populate('recruiterId', 'name email');
        job = job.toObject(); // convert to plain object to attach properties

        const recruiterInfo = await Recruiter.findOne({ userId: req.user._id });
        if (recruiterInfo) {
            job.recruiterId.companyName = recruiterInfo.companyName;
            job.recruiterId.companyLogo = recruiterInfo.companyLogo;
        }

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
