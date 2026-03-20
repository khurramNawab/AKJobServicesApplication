import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    resumeUrl: {
        type: String,
        default: ''
    },
    headline: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
        default: 'Prefer not to say'
    },
    age: {
        type: Number
    },
    address: {
        type: String,
        default: ''
    },
    skills: [{ type: String }],
    experience: [{
        title: String,
        company: String,
        duration: String, // e.g. "2020-2023"
        description: String
    }],
    education: [{
        degree: String,
        institution: String,
        year: String
    }],
    profilePhoto: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio can not be more than 500 characters']
    },
    preferredJobTitle: {
        type: String,
        default: ''
    },
    preferredLocation: {
        type: String,
        default: ''
    },
    privacy: {
        profileVisibility: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        showPhone: { type: Boolean, default: true },
        whatsappUpdates: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
