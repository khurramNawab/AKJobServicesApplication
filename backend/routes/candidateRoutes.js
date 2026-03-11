import express from 'express';
import { getMyCandidateProfile, updateCandidateProfile, uploadResume, uploadProfilePhoto } from '../controllers/candidateController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.route('/me')
    .get(protect, authorize('CANDIDATE'), getMyCandidateProfile)
    .put(protect, authorize('CANDIDATE'), updateCandidateProfile);

// Using the 'resume' field name matching what the frontend uses
router.post('/me/resume', protect, authorize('CANDIDATE'), (req, res, next) => {
    upload.single('resume')(req, res, function (err) {
        if (err) {
            console.error('Multer Upload Full Error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || JSON.stringify(err) || 'Unknown Multer/Cloudinary Error',
                rawError: err
            });
        }
        next();
    });
}, uploadResume);

router.post('/me/photo', protect, authorize('CANDIDATE'), (req, res, next) => {
    upload.single('photo')(req, res, function (err) {
        if (err) {
            console.error('Multer Upload Image Error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Unknown Upload Error'
            });
        }
        next();
    });
}, uploadProfilePhoto);

export default router;
