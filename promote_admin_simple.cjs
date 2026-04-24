const mongoose = require('mongoose');

const mongoUri = 'mongodb://127.0.0.1:27017/jobportal';

const promote = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB.');

        // Use direct collection access to bypass ESM model issues in script
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { phoneNumber: '9122049005' },
            { $set: { role: 'ADMIN' } }
        );

        if (result.matchedCount === 0) {
            console.log('User not found with phone number: 9122049005');
        } else {
            console.log('User 9122049005 promoted to ADMIN successfully!');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

promote();
