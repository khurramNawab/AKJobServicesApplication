import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['APPLICATION_STATUS', 'NEW_MESSAGE', 'JOB_MATCH', 'SYSTEM', 'BROADCAST'],
        default: 'SYSTEM'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isBroadcast: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    data: {
        type: Object
    }
}, {
    timestamps: true
});

// Index for fast broadcast history lookup
notificationSchema.index({ isBroadcast: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
