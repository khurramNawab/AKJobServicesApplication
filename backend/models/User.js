import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a phone number'],
        unique: true,
        match: [
            /^\+?\d{10,15}$/,
            'Please add a valid phone number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false // prevent password from being returned in queries
    },
    role: {
        type: String,
        enum: ['GUEST', 'CANDIDATE', 'RECRUITER', 'ADMIN'],
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
    otp: {
        type: String,
        select: false
    },
    otpExpire: {
        type: Date,
        select: false
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    console.log('[USER SCHEMA] Hashing password for user:', this.phoneNumber);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
