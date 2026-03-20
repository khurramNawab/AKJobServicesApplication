import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';

// @desc    Get recruiter profile
// @route   GET /api/v1/recruiters/me
// @access  Private (Recruiter only)
export const getMyRecruiterProfile = async (req, res) => {
    try {
        let recruiter = await Recruiter.findOne({ userId: req.user._id });

        // If recruiter profile doesn't exist yet, create an empty one implicitly
        if (!recruiter) {
            recruiter = await Recruiter.create({ userId: req.user._id });
        }

        const jobsCount = await Job.countDocuments({ recruiterId: req.user._id });
        const recruitersJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
        const jobIds = recruitersJobs.map(j => j._id);
        const applicantsCount = await Application.countDocuments({ jobId: { $in: jobIds } });

        res.status(200).json({
            success: true,
            data: recruiter,
            stats: {
                jobs: jobsCount,
                applicants: applicantsCount,
                interviews: await Application.countDocuments({ jobId: { $in: jobIds }, status: 'SHORTLISTED' })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update recruiter profile (companyName, location, industry, etc)
// @route   PUT /api/v1/recruiters/me
// @access  Private (Recruiter only)
export const updateRecruiterProfile = async (req, res) => {
    try {
        const recruiter = await Recruiter.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: recruiter
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload / Update recruiter company logo
// @route   POST /api/v1/recruiters/me/logo
// @access  Private (Recruiter only)
export const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const fileUrl = req.file.path; // Secured Cloudinary URL

        // UPSERT: update tracking if exists or create if not
        const recruiter = await Recruiter.findOneAndUpdate(
            { userId: req.user._id },
            { companyLogo: fileUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Company logo uploaded successfully',
            data: recruiter
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
