import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [
            function() { return this.authProvider === 'LOCAL'; },
            'Please add a password'
        ],
        minlength: 6,
        select: false // prevent password from being returned in queries
    },
    role: {
        type: String,
        enum: ['GUEST', 'CANDIDATE', 'RECRUITER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
        default: 'CANDIDATE'
    },
    authProvider: {
        type: String,
        enum: ['LOCAL', 'GOOGLE'],
        default: 'LOCAL'
    },
    isVerified: {
        type: Boolean,
        default: false
    },

    // ── OTP & Verification fields ──────────────────────────────
    otp: {
        type: String,
        select: false
    },
    otpExpire: {
        type: Date,
        select: false
    },
    verificationToken: {
        type: String,
        select: false
    },
    verificationTokenExpire: {
        type: Date,
        select: false
    },

    // ── Security: Account locking ───────────────────────────────
    failedLoginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        default: null,
        select: false
    },

    // ── Security: Refresh token tracking ────────────────────────
    refreshToken: {
        type: String,
        select: false,
    },

    // ── Security: Active sessions ───────────────────────────────
    sessions: {
        type: [{
            jti: String,
            hashedToken: String,
            deviceInfo: String,    // parsed UA string
            ipAddress: String,
            lastActive: { type: Date, default: Date.now }
        }],
        select: false
    },

    // ── Counters ────────────────────────────────────────────────
    loginCount: {
        type: Number,
        default: 0
    },

    // ── Ban / Moderation ────────────────────────────────────────
    isBanned: {
        type: Boolean,
        default: false,
    },
    banReason: {
        type: String,
        default: '',
    },

    // ── Monetization: Subscription Info ────────────────────────
    planType: {
        type: String,
        enum: ['FREE', 'BASIC', 'PREMIUM', 'PRO', 'ELITE'],
        default: 'FREE'
    },
    subscriptionStart: {
        type: Date,
        default: null
    },
    subscriptionEnd: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

// ═══ INDEXES ═══════════════════════════════════════════════════════
// TTL index: auto-clear expired OTPs at the DB level (MongoDB handles it)
userSchema.index({ otpExpire: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { otpExpire: { $exists: true } } });
// Fast role-based lookups for admin queries
userSchema.index({ role: 1, createdAt: -1 });

// ═══ VIRTUALS ══════════════════════════════════════════════════════
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ═══ PRE-SAVE HOOKS ═══════════════════════════════════════════════
userSchema.pre("save", async function () {
    // Only hash if password is modified
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// ═══ INSTANCE METHODS ═════════════════════════════════════════════

/** Compare entered password with stored hash */
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Handle a failed login — increment counter, lock if threshold hit.
 * Returns true if account is now locked.
 */
userSchema.methods.registerFailedLogin = async function () {
    return false;
};

/** Reset failed login state on successful login */
userSchema.methods.resetFailedLogins = async function () {
    if (this.failedLoginAttempts > 0 || this.lockUntil) {
        this.failedLoginAttempts = 0;
        this.lockUntil = null;
        await this.save();
    }
};

const User = mongoose.model('User', userSchema);
export default User;
