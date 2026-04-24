import mongoose from 'mongoose';
import dns from 'dns';

// 🌐 FORCE DNS RESOLUTION: Force Google DNS to bypass unreliable ISP DNS (fixes querySrv errors)
if (dns.setServers) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

/**
 * 🛡️ PRODUCTION RESILIENCE: MongoDB Connection & Auto-Recovery System
 * 
 * This module ensures the server stays alive even if the database is unreachable,
 * implementing an exponential retry logic to recover from network fluctuations.
 */

// Register global listeners ONCE to monitor connection health
mongoose.connection.on('connected', () => {
    console.log('✅ [DB] MongoDB Connection Established');
});

mongoose.connection.on('error', (err) => {
    console.error(`🔴 [DB] Runtime Error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    console.warn('🟡 [DB] MongoDB Disconnected');
});

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        
        if (!uri) {
            console.error('🛑 [DB] FATAL: MONGO_URI is undefined. Check your .env file!');
            return setTimeout(connectDB, 5000);
        }

        // Mask URI for safe logging: mongodb+srv://user:****@cluster...
        const maskedUri = uri.replace(/\/\/(.*):(.*)@/, '//****:****@');
        console.log(`🔄 [DB] Attempting connection to: ${maskedUri}`);

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Fail fast on initial attempt
            socketTimeoutMS: 45000,
            family: 4, // Force IPv4 to bypass DNS/Network SRV issues
        });

        console.log(`🚀 [DB] Matrix Cluster Online: ${mongoose.connection.host}/${mongoose.connection.name}`);
    } catch (error) {
        console.error('🛑 [DB] Connection Failed:', error.message);
        
        // 🛡️ PREVENT SERVER CRASH: Instead of process.exit(1), we trigger a retry
        console.log('🔁 [DB] Initializing auto-recovery... Retrying in 5 seconds.');
        
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
