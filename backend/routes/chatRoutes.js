import express from 'express';
import { getMyConversations, getMessages, sendMessage } from '../controllers/chatController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/conversations', protect, getMyConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/send', protect, sendMessage);

export default router;
