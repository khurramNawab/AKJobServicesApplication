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
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { planType, duration } = req.body; // duration: 'monthly' | 'yearly'
        let config = await PlatformConfig.findOne();
        if (!config) {
            config = await PlatformConfig.create({});
        }

        const role = req.user.role;
        let amount = 0;

        if (role === 'RECRUITER') {
            if (planType === 'PRO' || planType === 'BASIC') {
                amount = duration === 'monthly' ? config.pricing.basic.monthly : config.pricing.basic.yearly;
            } else if (planType === 'ELITE' || planType === 'PREMIUM') {
                amount = duration === 'monthly' ? config.pricing.premium.monthly : config.pricing.premium.yearly;
            } else {
                return res.status(400).json({ success: false, message: 'Invalid recruiter plan type' });
            }
        } else if (role === 'CANDIDATE') {
            if (!config.candidateSubscriptionEnabled) {
                return res.status(403).json({ success: false, message: 'Candidate subscriptions are currently disabled by admin.' });
            }

            if (planType === 'BASIC') {
                amount = duration === 'monthly' ? config.candidateBasicMonthly : config.candidateBasicYearly;
            } else if (planType === 'PREMIUM') {
                amount = duration === 'monthly' ? config.candidatePremiumMonthly : config.candidatePremiumYearly;
            } else {
                return res.status(400).json({ success: false, message: 'Invalid candidate plan type' });
            }
        } else {
            return res.status(403).json({ success: false, message: 'Role unauthorized for payment operations' });
        }

        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency: 'INR',
            receipt: `rcpt_${req.user._id.toString().slice(-10)}_${Date.now()}`,
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
        console.error("Error in createOrder:", error);
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

            let finalPlanType = planType;
            if (req.user.role === 'RECRUITER') {
                if (planType === 'BASIC') finalPlanType = 'PRO';
                else if (planType === 'PREMIUM') finalPlanType = 'ELITE';
            }

            await User.findByIdAndUpdate(req.user._id, {
                planType: finalPlanType,
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
