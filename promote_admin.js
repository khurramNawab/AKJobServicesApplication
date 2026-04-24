import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config();

const promoteToAdmin = async (phoneNumber) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        const user = await User.findOne({ phoneNumber });
        if (!user) {
            console.log('User not found with phone number:', phoneNumber);
            process.exit(1);
        }

        user.role = 'ADMIN';
        await user.save();
        console.log(`User ${user.name} (${phoneNumber}) promoted to ADMIN successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error.message);
        process.exit(1);
    }
};

promoteToAdmin('9122049005');
