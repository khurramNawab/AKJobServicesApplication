import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function promote() {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const result = await User.updateOne(
            { phoneNumber: '9122049005' },
            { $set: { role: 'ADMIN' } }
        );

        if (result.matchedCount === 0) {
            console.log('User not found.');
        } else {
            console.log('User 9122049005 promoted to ADMIN!');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

promote();
