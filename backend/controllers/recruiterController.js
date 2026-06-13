import Recruiter from '../models/Recruiter.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { deleteCloudinaryFile } from '../config/cloudinary.js';
import { invalidateCache } from '../utils/cache.js';

// Helper to invalidate all job detail and listing caches for a recruiter
const invalidateRecruiterJobsCache = async (userId) => {
    try {
        const jobs = await Job.find({ recruiterId: userId }).select('_id');
        for (const job of jobs) {
            await invalidateCache(`jobs:detail:${job._id}`).catch(err => console.error('Cache Inval Error:', err));
        }
        await invalidateCache('jobs:list:*').catch(err => console.error('Cache Inval Error:', err));
    } catch (err) {
        console.error('Error invalidating recruiter jobs cache:', err);
    }
};

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

        // Invalidate job detail caches to reflect updated recruiter/company details
        await invalidateRecruiterJobsCache(req.user._id);

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

        // Delete old logo if it exists to prevent orphaned assets in Cloudinary
        const existing = await Recruiter.findOne({ userId: req.user._id });
        if (existing?.companyLogo) {
            await deleteCloudinaryFile(existing.companyLogo, 'image');
        }

        // UPSERT: update tracking if exists or create if not
        const recruiter = await Recruiter.findOneAndUpdate(
            { userId: req.user._id },
            { companyLogo: fileUrl },
            { new: true, upsert: true }
        );

        // Invalidate job detail caches to reflect updated recruiter/company details
        await invalidateRecruiterJobsCache(req.user._id);

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

// @desc    Upload / Add recruiter company photo (Max 3, Total size <= 8MB)
// @route   POST /api/v1/recruiters/me/photo
// @access  Private (Recruiter only)
export const uploadCompanyPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image file' });
        }

        const fileUrl = req.file.path;
        const newFileSize = req.file.size || 0; // Size in bytes from Multer

        let existing = await Recruiter.findOne({ userId: req.user._id });
        if (!existing) {
            existing = await Recruiter.create({ userId: req.user._id });
        }

        // 1. Enforce Max 3 images limit
        if (existing.companyPhotos.length >= 3) {
            await deleteCloudinaryFile(fileUrl, 'image');
            return res.status(400).json({ success: false, message: 'Maximum 3 workspace images allowed.' });
        }

        // 2. Enforce 8MB total size limit
        const currentSizeSum = existing.companyPhotos.reduce((sum, p) => sum + p.size, 0);
        if (currentSizeSum + newFileSize > 8 * 1024 * 1024) {
            await deleteCloudinaryFile(fileUrl, 'image');
            return res.status(400).json({ 
                success: false, 
                message: `Total size of all workspace images cannot exceed 8MB. Current: ${(currentSizeSum / (1024 * 1024)).toFixed(2)}MB. Attempted upload: ${(newFileSize / (1024 * 1024)).toFixed(2)}MB.` 
            });
        }

        // Append new photo and save
        existing.companyPhotos.push({ url: fileUrl, size: newFileSize });
        await existing.save();

        // Invalidate job detail caches to reflect updated recruiter/company details
        await invalidateRecruiterJobsCache(req.user._id);

        res.status(200).json({
            success: true,
            message: 'Company workspace image added successfully to Cloudinary!',
            data: existing
        });
    } catch (error) {
        console.error("Upload Company Photo Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete specific company photos (single or multiple)
// @route   DELETE /api/v1/recruiters/me/photo
// @access  Private (Recruiter only)
export const deleteCompanyPhoto = async (req, res) => {
    try {
        const { url, urls } = req.body;
        
        let urlsToDelete = [];
        if (urls && Array.isArray(urls)) {
            urlsToDelete = urls;
        } else if (url) {
            urlsToDelete = [url];
        }

        if (urlsToDelete.length === 0) {
            return res.status(400).json({ success: false, message: 'Photo URL(s) required' });
        }

        const existing = await Recruiter.findOne({ userId: req.user._id });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Recruiter profile not found' });
        }

        // Filter photos that exist in the profile
        const validPhotosToDelete = existing.companyPhotos.filter(p => urlsToDelete.includes(p.url));
        if (validPhotosToDelete.length === 0) {
            return res.status(404).json({ success: false, message: 'None of the specified photos were found in the profile' });
        }

        // Delete each from Cloudinary
        for (const photo of validPhotosToDelete) {
            await deleteCloudinaryFile(photo.url, 'image');
        }

        // Remove from array and save
        existing.companyPhotos = existing.companyPhotos.filter(p => !urlsToDelete.includes(p.url));
        await existing.save();

        // Invalidate job detail caches to reflect updated recruiter/company details
        await invalidateRecruiterJobsCache(req.user._id);

        res.status(200).json({
            success: true,
            message: urlsToDelete.length > 1 ? 'Selected workspace images deleted successfully!' : 'Workspace image deleted successfully!',
            data: existing
        });
    } catch (error) {
        console.error("Delete Company Photo Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get all recruiters/companies (public)
// @route   GET /api/v1/recruiters
// @access  Public
export const getRecruiters = async (req, res) => {
    try {
        const recruiters = await Recruiter.find({ 'privacy.companyVisibility': { $ne: false } }).populate('userId', 'name email');

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

        if (recruiter.privacy?.companyVisibility === false) {
            return res.status(403).json({ success: false, message: 'Company profile is private' });
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
