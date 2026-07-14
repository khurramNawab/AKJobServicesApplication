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
    // ── Promo Video ───────────────────────────────────────
    promoVideo: {
        url: { type: String, default: '' },           // YouTube/Vimeo embed URL
        cloudinaryUrl: { type: String, default: '' }, // Direct Cloudinary upload URL
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        isActive: { type: Boolean, default: false },
        isMuted: { type: Boolean, default: true }
    },
    promoVideoDescriptions: {
        type: [String],
        default: [
            "Learn how our platform connects top talent with verified Indian employers. See the premium dashboard features, chat integrations, and advanced tools live in action.",
            "Discover the easiest way to find your dream job or the perfect candidate. Watch our quick tour.",
            "Join thousands of professionals and companies. Experience our seamless hiring process today."
        ]
    },
    promoVideoLibrary: [{
        url: { type: String, required: true },
        title: { type: String, default: '' },
        publicId: { type: String, default: '' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    // ── Candidate Subscription (Admin-Controlled) ─────────
    candidateSubscriptionEnabled: {
        type: Boolean,
        default: false  // OFF by default — admin turns it ON
    },
    candidateBasicMonthly: {
        type: Number,
        default: 299
    },
    candidateBasicYearly: {
        type: Number,
        default: 2999
    },
    candidatePremiumMonthly: {
        type: Number,
        default: 599
    },
    candidatePremiumYearly: {
        type: Number,
        default: 5999
    },
    candidateFreeApplicationLimit: {
        type: Number,
        default: 10  // Free candidates can apply to 10 jobs
    },
    // ──────────────────────────────────────────────────────
}, { timestamps: true });

const PlatformConfig = mongoose.model('PlatformConfig', platformConfigSchema);
export default PlatformConfig;
