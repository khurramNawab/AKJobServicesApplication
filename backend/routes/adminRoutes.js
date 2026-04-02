import express from 'express';
import { 
    getStats, 
    getAllUsers, 
    updateUser, 
    deleteJobAdmin,
    deleteUserAdmin,
    getAllJobsAdmin,
    broadcastNotification,
    getAdminActivity,
    getPlatformPlan,
    updatePlatformPlan
} from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protection to all admin routes
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUserAdmin);
router.get('/jobs', getAllJobsAdmin);
router.delete('/jobs/:id', deleteJobAdmin);
router.post('/broadcast', broadcastNotification);
router.get('/activity', getAdminActivity);
router.get('/platform-plan', getPlatformPlan);
router.put('/platform-plan', updatePlatformPlan);

export default router;
