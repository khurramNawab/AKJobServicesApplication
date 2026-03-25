import Candidate from '../models/Candidate.js';
import Application from '../models/Application.js';
import { uploadToFirebase } from '../config/upload.js';

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

        // Get statistics
        const stats = {
            applied: await Application.countDocuments({ candidateId: req.user._id }),
            interviews: await Application.countDocuments({ 
                candidateId: req.user._id, 
                status: { $in: ['REVIEWING', 'SHORTLISTED', 'HIRED'] } 
            }),
            matchRate: '84%' // Placeholder logic for now, could be based on skills
        };

        res.status(200).json({
            success: true,
            data: candidate,
            stats
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
        console.log('uploadResume via Firebase called');
        console.log('req.file:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
        }

        // Real Upload to Firebase Storage
        const fileUrl = await uploadToFirebase(req.file, "jobportal/resumes");

        // UPSERT: update array of object if exists or create if not
        const candidate = await Candidate.findOneAndUpdate(
            { userId: req.user._id },
            { resumeUrl: fileUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully with Firebase!',
            data: candidate
        });
    } catch (error) {
        console.error("Upload Resume Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload / Update candidate profile photo
// @route   PUT /api/v1/candidates/me/photo
// @access  Private (Candidate only)
export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        // Real Upload to Firebase Storage
        const fileUrl = await uploadToFirebase(req.file, "jobportal/avatars");

        const candidate = await Candidate.findOneAndUpdate(
            { userId: req.user._id },
            { profilePhoto: fileUrl },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully via Firebase!',
            data: candidate
        });
    } catch (error) {
        console.error("Upload Photo Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
