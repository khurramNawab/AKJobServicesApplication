import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Candidate from '../models/Candidate.js';
import Recruiter from '../models/Recruiter.js';
import { createNotification } from '../utils/notification.js';

// @desc    Get all conversations for the logged in user
// @route   GET /api/v1/chat/conversations
// @access  Private
export const getMyConversations = async (req, res) => {
    try {
        let conversations = await Conversation.find({
            participants: { $in: [req.user._id] }
        })
        .populate('participants', 'name email role phoneNumber')
        .sort({ updatedAt: -1 })
        .lean();

        // Enhance participants with their avatars
        conversations = await Promise.all(conversations.map(async (conv) => {
            const enhancedParticipants = await Promise.all(conv.participants.map(async (p) => {
                let avatar = '';
                if (p.role === 'CANDIDATE') {
                    const candidateProfile = await Candidate.findOne({ userId: p._id }).lean();
                    if (candidateProfile && candidateProfile.profilePhoto) {
                        avatar = candidateProfile.profilePhoto;
                    }
                } else if (p.role === 'RECRUITER' || p.role === 'ADMIN') {
                    const recruiterProfile = await Recruiter.findOne({ userId: p._id }).lean();
                    if (recruiterProfile && recruiterProfile.companyLogo) {
                        avatar = recruiterProfile.companyLogo;
                    }
                }
                return { ...p, avatar };
            }));
            
            return {
                ...conv,
                participants: enhancedParticipants
            };
        }));

        const enhancedConversations = await Promise.all(conversations.map(async (conv) => {
            const lastMessage = await Message.findOne({ conversationId: conv._id })
                .sort({ createdAt: -1 })
                .lean();
            
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                senderId: { $ne: req.user._id },
                isRead: false
            });

            return {
                ...conv,
                lastMessage,
                unreadCount
            };
        }));

        res.status(200).json({
            success: true,
            count: enhancedConversations.length,
            data: enhancedConversations
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/v1/chat/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(req.user._id)) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Mark messages as read
        await Message.updateMany(
            { conversationId, senderId: { $ne: req.user._id }, isRead: false },
            { $set: { isRead: true } }
        );

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a message (creates conversation if not exist)
// @route   POST /api/v1/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, text, attachments } = req.body;

        if (!receiverId || (!text && (!attachments || attachments.length === 0))) {
            return res.status(400).json({ success: false, message: 'Receiver ID and either text or attachments are required' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, receiverId]
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: req.user._id,
            text: text || '',
            attachments: attachments || []
        });

        // Update conversation's updatedAt
        conversation.updatedAt = Date.now();
        await conversation.save();

        // Send notification to receiver
        await createNotification(
            receiverId,
            'New Message',
            `${req.user.name} sent you a message`,
            'NEW_MESSAGE',
            { conversationId: conversation._id, senderId: req.user._id }
        );

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
