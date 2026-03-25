import express from 'express';
import { getMyRecruiterProfile, updateRecruiterProfile, uploadLogo } from '../controllers/recruiterController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/upload.js';

const router = express.Router();

router.route('/me')
    .get(protect, authorize('RECRUITER', 'ADMIN'), getMyRecruiterProfile)
    .put(protect, authorize('RECRUITER', 'ADMIN'), updateRecruiterProfile);

router.route('/me/logo')
    .post(protect, authorize('RECRUITER', 'ADMIN'), (req, res, next) => {
        upload.single('logo')(req, res, function (err) {
            if (err) {
                console.error('Multer Upload Error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Unknown Upload Error'
                });
            }
            next();
        });
    }, uploadLogo)
    .put(protect, authorize('RECRUITER', 'ADMIN'), (req, res, next) => {
        upload.single('logo')(req, res, function (err) {
            if (err) {
                console.error('Multer Upload Error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Unknown Upload Error'
                });
            }
            next();
        });
    }, uploadLogo);


export default router;
