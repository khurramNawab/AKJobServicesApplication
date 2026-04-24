import mongoose from 'mongoose';

const mongoUri = 'mongodb://127.0.0.1:27017/jobportal';

async function run() {
  try {
    console.log('Connecting to', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const User = mongoose.model('User', new mongoose.Schema({
      phoneNumber: String,
      role: String
    }));

    const user = await User.findOne({ phoneNumber: '9122049005' });
    if (!user) {
      console.log('User not found.');
    } else {
      user.role = 'ADMIN';
      await user.save();
      console.log('User promoted to ADMIN!');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
