import mongoose from 'mongoose';

const platformConfigSchema = new mongoose.Schema({
    subscriptionEnabled: {
        type: Boolean,
        default: false
    },
    freeMode: {
        type: Boolean,
        default: true
    },
    freeModeEndDate: {
        type: Date,
        default: null
    },
    pricing: {
        basic: {
            monthly: { type: Number, default: 999 },
            yearly: { type: Number, default: 8999 }
        },
        premium: {
            monthly: { type: Number, default: 1999 },
            yearly: { type: Number, default: 18999 }
        }
    },
    candidateMessagingMode: {
        type: String,
        enum: ['STRICT', 'MODERATE', 'OPEN'],
        default: 'STRICT'
    },
}, { timestamps: true });

const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
export default PlatformConfig;
