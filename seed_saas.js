import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';
import Job from './backend/models/Job.js';
import Subscription from './backend/models/Subscription.js';
import Payment from './backend/models/Payment.js';

dotenv.config();

const seedAdminData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to Database for Seeding...');

        // 1. Find some users to attach subscriptions/payments to
        const users = await User.find().limit(10);
        if (users.length === 0) {
            console.log('No users found. Please register some users first.');
            process.exit(1);
        }

        console.log('Cleaning old enterprise data...');
        await Subscription.deleteMany({});
        await Payment.deleteMany({});

        const plans = ['BASIC', 'PRO', 'ELITE'];
        const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'PENDING'];
        const amounts = { BASIC: 0, PRO: 999, ELITE: 2499 };

        console.log('Generating SaaS signals...');

        for (let i = 0; i < 20; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const plan = plans[Math.floor(Math.random() * plans.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Create Subscription
            const sub = await Subscription.create({
                userId: user._id,
                planType: plan,
                status: 'ACTIVE',
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });

            // Create Payment
            await Payment.create({
                userId: user._id,
                subscriptionId: sub._id,
                transactionId: `TXN-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
                amount: amounts[plan],
                status: status,
                paymentMethod: 'STRIPE'
            });
        }

        console.log('✅ Industrial Data Seeding Complete.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedAdminData();
