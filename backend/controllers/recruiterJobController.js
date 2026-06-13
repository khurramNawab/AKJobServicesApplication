import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Recruiter from '../models/Recruiter.js';

// @desc    Get jobs posted by the logged-in recruiter
// @route   GET /api/v1/jobs/me
// @access  Private (Recruiter only)
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 }).lean();

        // Retrieve recruiter profile details
        const recruiterInfo = await Recruiter.findOne({ userId: req.user._id }).lean();

        // Dynamically count applications for each job to ensure 100% accuracy and sync
        const jobsWithCount = await Promise.all(jobs.map(async (job) => {
            const count = await Application.countDocuments({ jobId: job._id });
            
            // Auto self-heal: sync count back to Job document if out of sync
            if (job.applicantsCount !== count) {
                await Job.updateOne({ _id: job._id }, { applicantsCount: count });
            }

            // Populate recruiterId with name, email, companyName, companyLogo
            const populatedRecruiter = {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                companyName: recruiterInfo ? recruiterInfo.companyName : '',
                companyLogo: recruiterInfo && recruiterInfo.companyLogo ? recruiterInfo.companyLogo.replace('http://', 'https://') : ''
            };
            
            return {
                ...job,
                recruiterId: populatedRecruiter,
                applicantsCount: count
            };
        }));

        console.log(`🔍 [JOB] Fetching jobs for Recruiter: ${req.user.email} (Count: ${jobsWithCount.length})`);
        res.status(200).json({
            success: true,
            count: jobsWithCount.length,
            data: jobsWithCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
