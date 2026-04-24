import express from 'express';
import { getJobs, getJob, createJob, updateJob, deleteJob } from '../controllers/jobController.js';
import { getMyJobs } from '../controllers/recruiterJobController.js';
import { applyForJob } from '../controllers/applicationController.js';
import { seedJobs } from '../controllers/seedController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import { checkSubscription } from '../middlewares/subscriptionMiddleware.js';

const router = express.Router();

router.post('/seed', protect, authorizeRoles('RECRUITER', 'ADMIN'), seedJobs);

router.get('/me', protect, authorizeRoles('RECRUITER', 'ADMIN'), getMyJobs);

router.route('/')
    .get(getJobs)
    .post(protect, authorizeRoles('RECRUITER', 'ADMIN'), checkSubscription, createJob);

router.route('/:id')
    .get(getJob)
    .put(protect, authorizeRoles('RECRUITER', 'ADMIN'), updateJob)
    .delete(protect, authorizeRoles('RECRUITER', 'ADMIN'), deleteJob);

router.post('/:jobId/apply', protect, authorizeRoles('CANDIDATE'), applyForJob);

export default router;
