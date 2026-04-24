import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    to: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING'],
        default: 'PENDING',
    },
    attempts: {
        type: Number,
        default: 0,
    },
    error: {
        type: String,
        default: null,
    }
}, {
    timestamps: true
});

// For quick debugging or admin metrics
emailLogSchema.index({ status: 1, createdAt: -1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
