import Job from '../models/Job.js';

const mockJobs = [
    {
        title: 'Senior React Native Developer',
        description: 'We are looking for an experienced React Native developer to lead our mobile app team. You will be responsible for architecture, performance tuning, and mentoring juniors.',
        requirements: '5+ years experience with React Native, strong understanding of Redux/Zustand, experience with Expo and native modules.',
        skills: ['React Native', 'JavaScript', 'TypeScript', 'Redux', 'Zustand', 'Expo'],
        salaryRange: {
            min: 80000,
            max: 120000,
            currency: 'USD'
        },
        location: 'Remote (US)',
        type: 'Full-time'
    },
    {
        title: 'Full Stack MERN Developer',
        description: 'Join our fast-growing startup! You will be working on both the backend systems in Node.js/MongoDB and the frontend in React.',
        requirements: '3+ years with Node.js, Express, and React. Strong database design skills using MongoDB and Mongoose.',
        skills: ['Node.js', 'Express', 'React', 'MongoDB', 'REST APIs'],
        salaryRange: {
            min: 70000,
            max: 100000,
            currency: 'USD'
        },
        location: 'San Francisco, CA',
        type: 'Full-time'
    },
    {
        title: 'UI/UX Mobile Designer',
        description: 'Looking for a creative designer who understands mobile-first design principles to create beautiful and intuitive user interfaces for our job portal.',
        requirements: 'Portfolio demonstrating mobile app designs. Proficiency in Figma and Adobe Creative Suite.',
        skills: ['Figma', 'UI Design', 'UX Research', 'Mobile First'],
        salaryRange: {
            min: 60000,
            max: 90000,
            currency: 'USD'
        },
        location: 'London, UK (Hybrid)',
        type: 'Part-time'
    }
];

export const seedJobs = async (req, res) => {
    try {
        // Need a recruiter ID to assign these jobs to
        const recruiterId = req.user._id;

        // Add recruiter to mock data
        const jobsWithRecruiter = mockJobs.map(job => ({ ...job, recruiterId }));

        // Insert
        await Job.insertMany(jobsWithRecruiter);

        res.status(201).json({
            success: true,
            message: 'Mock jobs seeded successfully',
            count: jobsWithRecruiter.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
