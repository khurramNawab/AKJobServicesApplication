import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

const debugAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- ADMIN DEBUG ---');
        const user = await User.findOne({ phoneNumber: '9122049005' }).select('+password');
        
        if (user) {
            console.log('User Found:');
            console.log('- Name:', user.name);
            console.log('- Phone:', user.phoneNumber);
            console.log('- Role:', user.role);
            console.log('- Verified:', user.isVerified);
            console.log('- Password Hash exists:', !!user.password);
            
            // Test the 789456 password
            const isMatch = await user.matchPassword('789456');
            console.log('- Does 789456 match hashed password?', isMatch);
        } else {
            console.log('User 9122049005 NOT FOUND in database.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Debug failed:', error);
        process.exit(1);
    }
};

debugAdmin();
