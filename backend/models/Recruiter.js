import mongoose from 'mongoose';

const recruiterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    industry: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    foundedDate: {
        type: String,
        default: ''
    },
    baseLocations: {
        type: String,
        default: ''
    },
    companyType: {
        type: String,
        default: ''
    },
    companyLogo: {
        type: String,
        default: ''
    },
    companyPhotos: {
        type: [{
            url: { type: String, required: true },
            size: { type: Number, required: true }
        }],
        default: []
    },
    designation: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    // ── New Spec Fields ────────────────────────────────────
    gstNumber: {
        type: String,
        default: ''
    },
    companyAddress: {
        type: String,
        default: ''
    },
    // ──────────────────────────────────────────────────────
    privacy: {
        companyVisibility: { type: Boolean, default: true },
        whatsappUpdates: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export default Recruiter;
