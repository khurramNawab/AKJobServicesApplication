import Job from '../models/Job.js';

// @desc    Get jobs posted by the logged-in recruiter
// @route   GET /api/v1/jobs/me
// @access  Private (Recruiter only)
export const getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });

        console.log(`🔍 [JOB] Fetching jobs for Recruiter: ${req.user.email} (Count: ${jobs.length})`);
        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
