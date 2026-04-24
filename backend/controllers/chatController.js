import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { createNotification } from '../utils/notification.js';

// @desc    Get all conversations for the logged in user
// @route   GET /api/v1/chat/conversations
// @access  Private
export const getMyConversations = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const conversations = await Conversation.aggregate([
            { $match: { participants: userId } },
            { $sort: { updatedAt: -1 } },
            // 👤 Lookup participants
            {
                $lookup: {
                    from: 'users',
                    localField: 'participants',
                    foreignField: '_id',
                    as: 'participantDetails'
                }
            },
            // ✉️ Lookup messages for counts and last message
            {
                $lookup: {
                    from: 'messages',
                    let: { convId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$conversationId', '$$convId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'lastMessage'
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { convId: '$_id' },
                    pipeline: [
                        { 
                            $match: { 
                                $expr: { 
                                    $and: [
                                        { $eq: ['$conversationId', '$$convId'] },
                                        { $ne: ['$senderId', userId] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                } 
                            } 
                        },
                        { $count: 'unread' }
                    ],
                    as: 'unreadInfo'
                }
            },
            {
                $project: {
                    _id: 1,
                    updatedAt: 1,
                    participants: {
                        $map: {
                            input: '$participantDetails',
                            as: 'p',
                            in: {
                                _id: '$$p._id',
                                name: '$$p.name',
                                role: '$$p.role',
                                avatar: '$$p.avatar' // Ensure avatar exists in user model or via separate profile lookup if needed
                            }
                        }
                    },
                    lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
                    unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreadInfo.unread', 0] }, 0] }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a specific conversation (With Pagination)
// @route   GET /api/v1/chat/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Mark messages as read (Atomic update)
        await Message.updateMany(
            { conversationId, senderId: { $ne: req.user._id }, isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            page,
            data: messages.reverse() // Return in chronological order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a message (Atomic Send)
// @route   POST /api/v1/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, text, attachments } = req.body;

        if (!receiverId || (!text && (!attachments || attachments.length === 0))) {
            return res.status(400).json({ success: false, message: 'Content required' });
        }

        // Atomic Find or Create Conversation
        let conversation = await Conversation.findOneAndUpdate(
            { participants: { $all: [req.user._id, receiverId] } },
            { $setOnInsert: { participants: [req.user._id, receiverId] } },
            { upsert: true, new: true }
        );

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            text: text || '',
            attachments: attachments || []
        });

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversation._id, { updatedAt: Date.now() });

        // Notification logic (Fire and forget or queue)
        createNotification(
            receiverId,
            'New Message',
            `${req.user.name} sent you a message`,
            'NEW_MESSAGE',
            { conversationId: conversation._id, senderId: req.user._id }
        ).catch(err => console.error('Notification Error:', err));

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

