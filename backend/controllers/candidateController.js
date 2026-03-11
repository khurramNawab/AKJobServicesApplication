import Candidate from '../models/Candidate.js';

// @desc    Get Candidate profile
// @route   GET /api/v1/candidates/me
// @access  Private (Candidate only)
export const getMyCandidateProfile = async (req, res) => {
    try {
        let candidate = await Candidate.findOne({ userId: req.user._id });

        // If candidate doesn't exist yet, create loosely
        if (!candidate) {
            candidate = await Candidate.create({ userId: req.user._id });
        }

        res.status(200).json({
            success: true,
            data: candidate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Candidate profile (Bio, skills, exp)
// @route   PUT /api/v1/candidates/me
// @access  Private (Candidate only)
export const updateCandidateProfile = async (req, res) => {
    try {
        const candidate = await Candidate.findOneAndUpdate(
            { userId: req.user._id },
            req.body,
            { new: true, runValidators: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            data: candidate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload / Update candidate resume
// @route   PUT /api/v1/candidates/me/resume
// @access  Private (Candidate only)
export const uploadResume = async (req, res) => {
    try {
        console.log('uploadResume called');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);
        // req.file is injected by Multer Cloudinary storage
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
        }

        const fileUrl = req.file.path; // Secured Cloudinary URL

        // UPSERT: update array of object if exists or create if not
        const candidate = await Candidate.findOneAndUpdate(
            { userId: req.user._id },
            { resumeUrl: fileUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            data: candidate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload / Update candidate profile photo
// @route   POST /api/v1/candidates/me/photo
// @access  Private (Candidate only)
export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const fileUrl = req.file.path;

        const candidate = await Candidate.findOneAndUpdate(
            { userId: req.user._id },
            { profilePhoto: fileUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: candidate
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
