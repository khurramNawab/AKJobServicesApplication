import express from 'express';
import { getMyNotifications, markAsRead, clearAllNotifications } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getMyNotifications)
    .delete(protect, clearAllNotifications);

router.put('/:id/read', protect, markAsRead);

export default router;
