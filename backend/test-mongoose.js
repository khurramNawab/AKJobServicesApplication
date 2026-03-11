import mongoose from 'mongoose';
import Application from './models/Application.js';
import Job from './models/Job.js';

const test = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/jobportal');
        console.log('Connected');

        const jobs = await Job.find({});
        console.log('Jobs:', jobs.length);

        if (jobs.length > 0) {
            const job = jobs[0];
            const app = new Application({
                jobId: job._id,
                candidateId: job.recruiterId // Just for test mock
            });
            await app.save();
            console.log('Application saved successfully');
        } else {
            console.log('No jobs to test application on');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit();
    }
};

test();
