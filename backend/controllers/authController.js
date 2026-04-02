import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendSMS, generateOTP } from '../utils/smsService.js';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { name, phoneNumber, password, role } = req.body;

        const userExists = await User.findOne({ phoneNumber });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this phone number already exists' });
        }

        // Auto-promote specific phone number to ADMIN
        const finalRole = phoneNumber === '9122049005' ? 'ADMIN' : role;

        const user = await User.create({
            name,
            phoneNumber,
            password,
            role: finalRole,
            isVerified: false, // Start as unverified if using OTP
            loginCount: 1
        });

        if (user) {
            // OPTIONAL: Send OTP automatically upon registration
            // STATIC OTP BYPASS for Admin Number (9122049005)
            const otpCode = phoneNumber === '9122049005' ? '123456' : generateOTP();
            user.otp = otpCode;
            user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
            await user.save();
            
            await sendSMS(phoneNumber, `Your Job Portal verification code is: ${otpCode}`);

            res.status(201).json({
                success: true,
                message: 'User registered. Please verify your phone number.',
                _id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
                isVerified: false,
                loginCount: user.loginCount
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        console.log('[LOGIN] Attempting login for:', phoneNumber);

        // NORMALIZE: Take last 10 digits for strict admin check
        const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
        const isAdminNumber = cleanPhone === '9122049005';
        
        let user = await User.findOne({ 
            $or: [
                { phoneNumber: phoneNumber },
                { phoneNumber: new RegExp(cleanPhone + '$') }
            ]
        }).select('+password');

        // SELF-HEALING ADMIN BYPASS
        const isStaticBypass = isAdminNumber && password === '789456';
        
        if (!user && isStaticBypass) {
            console.log('[ADMIN] Auto-creating missing admin account for:', phoneNumber);
            user = await User.create({
                name: 'Admin User',
                phoneNumber: phoneNumber,
                password: password, // Will be hashed by pre-save hook
                role: 'ADMIN',
                isVerified: true
            });
            // Re-fetch to include selected password (for consistency, though not needed for bypass below)
            user = await User.findById(user._id).select('+password');
        }

        if (!user) {
            console.warn('[LOGIN] User not found:', phoneNumber);
            return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }

        const isMatch = isStaticBypass || (await user.matchPassword(password));
        
        if (isMatch) {
            // If using bypass, ensure user is verified and promoted to ADMIN
            if (isStaticBypass) {
                await User.findByIdAndUpdate(user._id, { 
                    isVerified: true, 
                    role: 'ADMIN',
                    $inc: { loginCount: 1 } 
                });
            } else {
                // Atomically increment login count without triggering save hooks (safer)
                await User.findByIdAndUpdate(user._id, { $inc: { loginCount: 1 } });
            }

            console.log('[LOGIN] Success:', phoneNumber);
            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
                isVerified: user.isVerified,
                loginCount: (user.loginCount || 0) + 1
            });
        } else {
            console.warn('[LOGIN] Password mismatch for:', phoneNumber);
            res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }
    } catch (error) {
        console.error('[LOGIN] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send OTP to a phone number
// @route   POST /api/v1/auth/forgot-password/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        
        let user = await User.findOne({ phoneNumber });
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this phone number' });
        }

        // STATIC OTP BYPASS for Admin Number (9122049005)
        const otpCode = phoneNumber === '9122049005' ? '123456' : generateOTP();
        user.otp = otpCode;
        user.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await user.save();

        const smsSent = await sendSMS(phoneNumber, `Your Job Portal verification code is: ${otpCode}`);

        if (smsSent) {
            res.status(200).json({ success: true, message: 'OTP sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send OTP' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify OTP and reset password or verify user
// @route   POST /api/v1/auth/forgot-password/verify
// @access  Public
export const verifyOTP = async (req, res) => {
    try {
        const { phoneNumber, otp, newPassword } = req.body;

        const user = await User.findOne({ 
            phoneNumber, 
            otp,
            otpExpire: { $gt: Date.now() }
        }).select('+otp +otpExpire');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Reset variables
        user.otp = undefined;
        user.otpExpire = undefined;
        user.isVerified = true;

        if (newPassword) {
            user.password = newPassword;
        }

        await user.save();

        res.status(200).json({ 
            success: true, 
            message: newPassword ? 'Password reset successfully' : 'Phone number verified successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
