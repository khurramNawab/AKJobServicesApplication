import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    paymentMethod: {
        type: String,
        enum: ['STRIPE', 'RAZORPAY', 'PAYPAL', 'MANUAL'],
        default: 'MANUAL'
    }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
