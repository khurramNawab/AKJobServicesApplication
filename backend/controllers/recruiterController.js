import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
// Cloudinary storage handles the upload via middleware


// @desc    Get recruiter profile
// @route   GET /api/v1/recruiters/me
// @access  Private (Recruiter only)
export const getMyRecruiterProfile = async (req, res) => {
    try {
        console.log(`[RecruiterProfile] Fetching profile for user: ${req.user._id}`);
        let recruiter = await Recruiter.findOne({ userId: req.user._id });

        // If recruiter profile doesn't exist yet, create an empty one implicitly
        if (!recruiter) {
            console.log(`[RecruiterProfile] Creating new recruiter profile for user: ${req.user._id}`);
            recruiter = await Recruiter.create({ userId: req.user._id });
        }

        const jobsCount = await Job.countDocuments({ recruiterId: req.user._id });
        const recruitersJobs = await Job.find({ recruiterId: req.user._id }).select('_id');
        const jobIds = recruitersJobs.map(j => j._id);
        
        let applicantsCount = 0;
        let interviewsCount = 0;

        if (jobIds.length > 0) {
            applicantsCount = await Application.countDocuments({ jobId: { $in: jobIds } });
            interviewsCount = await Application.countDocuments({ jobId: { $in: jobIds }, status: 'SHORTLISTED' });
        }

        res.status(200).json({
            success: true,
            data: recruiter,
            stats: {
                jobs: jobsCount,
                applicants: applicantsCount,
                interviews: interviewsCount
            }
        });
    } catch (error) {
        console.error("GET RECRUITER PROFILE ERROR:", error);
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

        // Cloudinary uploads automatically via Multer middleware
        const fileUrl = req.file.path;

        // UPSERT: update tracking if exists or create if not
        const recruiter = await Recruiter.findOneAndUpdate(
            { userId: req.user._id },
            { companyLogo: fileUrl },
            { new: true, upsert: true }
        );


        res.status(200).json({
            success: true,
            message: 'Company logo uploaded successfully to Cloudinary!',

            data: recruiter
        });
    } catch (error) {
        console.error("Upload Logo Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all recruiters/companies (public)
// @route   GET /api/v1/recruiters
// @access  Public
export const getRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.find().populate('userId', 'name email');

        res.status(200).json({
            success: true,
            count: recruiters.length,
            data: recruiters
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get specific recruiter/company by ID (public)
// @route   GET /api/v1/recruiters/:id
// @access  Public
export const getRecruiterById = async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.params.id).populate('userId', 'name email');
        
        if (!recruiter) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        const activeJobs = await Job.find({ recruiterId: recruiter.userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: recruiter,
            jobs: activeJobs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
