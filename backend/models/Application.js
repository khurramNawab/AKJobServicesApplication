import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
        default: 'APPLIED'
    },
    coverLetter: {
        type: String,
        default: ''
    },
    resumeVersionUrl: {
        type: String,
        default: '' // We will link S3/Cloudinary URL here later
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED'],
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

// Prevent user from applying to the same job twice
applicationSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
