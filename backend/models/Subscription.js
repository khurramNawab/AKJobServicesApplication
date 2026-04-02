import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planType: {
        type: String,
        enum: ['BASIC', 'PRO', 'ELITE'],
        default: 'BASIC'
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
        default: 'ACTIVE'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
