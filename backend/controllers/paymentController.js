import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import PlatformConfig from '../models/PlatformConfig.js';

// Initialize Razorpay
// Note: Make sure to add these to your .env file
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
});

// @desc    Create Razorpay Order
// @route   POST /api/v1/payments/create-order
// @access  Private (Recruiter)
export const createOrder = async (req, res) => {
    try {
        const { planType, duration } = req.body; // duration: 'monthly' | 'yearly'
        const config = await PlatformConfig.findOne();
        if (!config) return res.status(500).json({ success: false, message: 'Platform configuration missing' });

        let amount = 0;
        if (planType === 'BASIC') {
            amount = duration === 'monthly' ? config.pricing.basic.monthly : config.pricing.basic.yearly;
        } else if (planType === 'PREMIUM') {
            amount = duration === 'monthly' ? config.pricing.premium.monthly : config.pricing.premium.yearly;
        } else {
            return res.status(400).json({ success: false, message: 'Invalid plan type' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}_${req.user._id}`,
        };

        const order = await razorpay.orders.create(options);

        // Store pending payment in DB
        await Payment.create({
            userId: req.user._id,
            amount,
            orderId: order.id,
            status: 'PENDING',
            receipt: options.receipt
        });

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/v1/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, duration } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Update Payment record
            const payment = await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { 
                    status: 'SUCCESS',
                    transactionId: razorpay_payment_id
                },
                { new: true }
            );

            // Update User Subscription
            const now = new Date();
            const endDate = new Date();
            if (duration === 'monthly') {
                endDate.setMonth(now.getMonth() + 1);
            } else {
                endDate.setFullYear(now.getFullYear() + 1);
            }

            await User.findByIdAndUpdate(req.user._id, {
                planType,
                subscriptionStart: now,
                subscriptionEnd: endDate,
                isActive: true
            });

            res.status(200).json({
                success: true,
                message: 'Payment verified and plan activated successfully'
            });
        } else {
            // Update Payment record to FAILED
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'FAILED' }
            );

            res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
