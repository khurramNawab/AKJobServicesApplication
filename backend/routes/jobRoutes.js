import express from 'express';
import { getJobs, getJob, createJob } from '../controllers/jobController.js';
import { getMyJobs } from '../controllers/recruiterJobController.js';
import { applyForJob } from '../controllers/applicationController.js';
import { seedJobs } from '../controllers/seedController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/seed', protect, authorize('RECRUITER', 'ADMIN'), seedJobs);

router.get('/me', protect, authorize('RECRUITER', 'ADMIN'), getMyJobs);

router.route('/')
    .get(getJobs)
    .post(protect, authorize('RECRUITER', 'ADMIN'), createJob);

router.route('/:id')
    .get(getJob);

router.post('/:jobId/apply', protect, authorize('CANDIDATE'), applyForJob);

export default router;
