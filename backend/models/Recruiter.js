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
    companyLogo: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export default Recruiter;
