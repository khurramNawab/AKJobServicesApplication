import "dotenv/config";
import mongoose from "mongoose";
import Job from "../models/Job.js";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const debugJobs = async () => {
    await connectDB();
    
    try {
        // 1. Find a recruiter user
        const user = await User.findOne({ role: 'RECRUITER' });
        if (!user) {
            console.log("❌ No recruiter user found. Create one first.");
            process.exit(1);
        }
        console.log(`✅ Using Recruiter User: ${user.email} (${user._id})`);

        // 2. Create a test job
        const jobData = {
            title: "Debug Job " + Date.now(),
            description: "A test job for debugging visibility issues.",
            requirements: "Test requirements",
            location: "Remote",
            type: "Full-time",
            recruiterId: user._id
        };

        const job = await Job.create(jobData);
        console.log(`✅ Job Created Successfully: ${job._id}`);
        console.log(`   Status: ${job.status}`);

        // 3. Verify visibility in general list (getJobs logic)
        const visibleJobs = await Job.find({ status: 'OPEN' });
        const isVisible = visibleJobs.some(j => j._id.toString() === job._id.toString());
        console.log(`🔍 Visible in 'OPEN' list? ${isVisible ? 'YES' : 'NO'}`);

        // 4. Verify visibility in recruiter list (getMyJobs logic)
        const recruiterJobs = await Job.find({ recruiterId: user._id });
        const isVisibleInMe = recruiterJobs.some(j => j._id.toString() === job._id.toString());
        console.log(`🔍 Visible in recruiter's own list? ${isVisibleInMe ? 'YES' : 'NO'}`);

        // 5. Check for "Freelance" enum issue
        try {
            console.log("🔄 Testing 'Freelance' type...");
            await Job.create({
                ...jobData,
                title: "Freelance Test",
                type: "Freelance"
            });
            console.log("✅ 'Freelance' allowed (Wait, it shouldn't be based on model enum!)");
        } catch (e) {
            console.log(`❌ 'Freelance' REJECTED: ${e.message}`);
        }

    } catch (err) {
        console.error("🛑 Debug failed:", err);
    } finally {
        mongoose.connection.close();
    }
};

debugJobs();
