import express from 'express';
import { getMyApplications, getJobApplicants, updateApplicationStatus, checkApplicationStatus } from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get applications of the currently logged in user
router.get('/me', protect, authorize('CANDIDATE'), getMyApplications);

// Check if candidate has already applied for a specific job
router.get('/check/:jobId', protect, authorize('CANDIDATE'), checkApplicationStatus);

// Get applicants for a specific job (Recruiter view)
router.get('/job/:jobId', protect, authorize('RECRUITER', 'ADMIN'), getJobApplicants);

// Update applicant status (Recruiter view)
router.put('/:id/status', protect, authorize('RECRUITER', 'ADMIN'), updateApplicationStatus);

export default router;
