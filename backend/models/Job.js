import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title']
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    requirements: {
        type: String,
        required: [true, 'Please add job requirements']
    },
    skills: [String],
    salaryRange: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'],
        required: [true, 'Please specify job type']
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'DRAFT'],
        default: 'OPEN'
    },
    applicantsCount: {
        type: Number,
        default: 0
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
