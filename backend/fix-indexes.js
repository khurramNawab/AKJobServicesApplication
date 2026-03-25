import mongoose from 'mongoose';
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';

const fixIndexes = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        
        console.log('Dropping email_1 index...');
        try {
            await User.collection.dropIndex('email_1');
            console.log('Successfully dropped email_1 index.');
        } catch (err) {
            if (err.codeName === 'IndexNotFound') {
                console.log('Index email_1 not found, nothing to drop.');
            } else {
                throw err;
            }
        }

        console.log('Indexes after drop:', await User.collection.getIndexes());
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing indexes:', error);
        process.exit(1);
    }
};

fixIndexes();
