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
        enum: ['APPLICATION_STATUS', 'NEW_MESSAGE', 'JOB_MATCH', 'SYSTEM'],
        default: 'SYSTEM'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    data: {
        type: Object
    }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
