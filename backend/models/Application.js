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
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED'],
        default: 'PENDING'
    },
    reviewedByAdmin: {
        type: Boolean,
        default: false
    },
    coverLetter: {
        type: String,
        default: ''
    },
    resumeVersionUrl: {
        type: String,
        default: ''
    },
    // ── Candidate Apply Fields (Spec) ────────────────────
    educationDetails: [{
        degree: { type: String, default: '' },
        institution: { type: String, default: '' },
        year: { type: String, default: '' }
    }],
    workExperience: [{
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' }
    }],
    skills: [{ type: String }],
    expectedSalary: {
        type: String,
        default: ''
    },
    noticePeriod: {
        type: String,
        default: ''
    },
    // ─────────────────────────────────────────────────────
    statusHistory: [
        {
            status: {
                type: String,
                enum: ['PENDING', 'APPROVED', 'REJECTED', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED'],
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

// Optimize query patterns for candidates, recruiters, and jobs
applicationSchema.index({ candidateId: 1, createdAt: -1 });
applicationSchema.index({ recruiterId: 1, status: 1, createdAt: -1 });
applicationSchema.index({ jobId: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
