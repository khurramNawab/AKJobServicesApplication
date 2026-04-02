import express from 'express';
import { toggleSavedJob, getMySavedJobs, checkIfSaved } from '../controllers/savedJobController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/toggle/:jobId', toggleSavedJob);
router.get('/me', getMySavedJobs);
router.get('/check/:jobId', checkIfSaved);

export default router;
