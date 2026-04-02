import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';
    console.log(`📡 [DB] Attempting to connect to: ${uri}`);
    
    const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
    
    console.log(`✅ [DB] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [DB] Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
