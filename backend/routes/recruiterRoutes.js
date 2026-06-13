import express from 'express';
import { getMyRecruiterProfile, updateRecruiterProfile, uploadLogo, uploadCompanyPhoto, deleteCompanyPhoto, getRecruiters, getRecruiterById } from '../controllers/recruiterController.js';
import { protect, authorizeRoles as authorize } from '../middlewares/authMiddleware.js';
import upload from '../config/upload.js';

const router = express.Router();

router.get('/', getRecruiters);
router.get('/list', getRecruiters);

router.route('/me')
    .get(protect, authorize('RECRUITER', 'ADMIN'), getMyRecruiterProfile)
    .put(protect, authorize('RECRUITER', 'ADMIN'), updateRecruiterProfile);

router.get('/:id', getRecruiterById);

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

router.route('/me/photo')
    .post(protect, authorize('RECRUITER', 'ADMIN'), (req, res, next) => {
        upload.single('photo')(req, res, function (err) {
            if (err) {
                console.error('Multer Upload Error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Unknown Upload Error'
                });
            }
            next();
        });
    }, uploadCompanyPhoto)
    .put(protect, authorize('RECRUITER', 'ADMIN'), (req, res, next) => {
        upload.single('photo')(req, res, function (err) {
            if (err) {
                console.error('Multer Upload Error:', err);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Unknown Upload Error'
                });
            }
            next();
        });
    }, uploadCompanyPhoto)
    .delete(protect, authorize('RECRUITER', 'ADMIN'), deleteCompanyPhoto);


export default router;
