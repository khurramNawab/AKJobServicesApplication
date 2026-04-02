import mongoose from 'mongoose';

// This model stores the globally editable platform subscription settings
// Only one document exists (singleton pattern via findOneAndUpdate upsert)
const platformPlanSchema = new mongoose.Schema({
    // Free Tier Config
    freeTierEnabled: {
        type: Boolean,
        default: true
    },
    freeTierExpiryDate: {
        type: Date,
        default: null  // null = unlimited, date = when free becomes paid
    },
    freeTierJobApplicationLimit: {
        type: Number,
        default: 5
    },
    freeTierJobPostLimit: {
        type: Number,
        default: 2
    },

    // Pro Plan Config
    proEnabled: {
        type: Boolean,
        default: true
    },
    proMonthlyPrice: {
        type: Number,
        default: 999
    },
    proYearlyPrice: {
        type: Number,
        default: 8999
    },
    proJobApplicationLimit: {
        type: Number,
        default: -1  // -1 = unlimited
    },

    // Elite Plan Config
    eliteEnabled: {
        type: Boolean,
        default: true
    },
    eliteMonthlyPrice: {
        type: Number,
        default: 2499
    },
    eliteYearlyPrice: {
        type: Number,
        default: 22999
    },

    // Platform-wide switch
    platformMode: {
        type: String,
        enum: ['ALL_FREE', 'FREEMIUM', 'ALL_PAID'],
        default: 'FREEMIUM'  // FREEMIUM = free tier exists alongside paid
    },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

const PlatformPlan = mongoose.model('PlatformPlan', platformPlanSchema);
export default PlatformPlan;
