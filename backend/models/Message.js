import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: function() {
            return !this.attachments || this.attachments.length === 0;
        }
    },
    attachments: [{
        url: { type: String, required: true },
        fileType: { type: String, enum: ['IMAGE', 'DOCUMENT'], required: true },
        fileName: { type: String }
    }],
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
