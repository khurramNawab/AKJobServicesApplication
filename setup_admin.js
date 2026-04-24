import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './backend/models/User.js';

dotenv.config({ path: './backend/.env' });

const setupAdmin = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const adminEmail = 'admin@akjobservices.com';
        const adminPassword = 'Admin@741';

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log(`ℹ️ Admin user ${adminEmail} found. Updating password and role...`);
            user.password = adminPassword;
            user.role = 'ADMIN';
            user.isVerified = true;
            await user.save();
            console.log('✅ Admin updated successfully!');
        } else {
            console.log(`🆕 Creating new Admin user: ${adminEmail}...`);
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword,
                role: 'ADMIN',
                isVerified: true,
                authProvider: 'LOCAL'
            });
            console.log('✅ Admin created successfully!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
};

setupAdmin();
