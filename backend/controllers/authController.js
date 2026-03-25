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

        const user = await User.create({
            name,
            phoneNumber,
            password,
            role,
            isVerified: false // Start as unverified if using OTP
        });

        if (user) {
            // OPTIONAL: Send OTP automatically upon registration
            const otpCode = generateOTP();
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
                isVerified: false
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

        const user = await User.findOne({ phoneNumber }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user.id,
                name: user.name,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
                isVerified: user.isVerified
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }
    } catch (error) {
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
        
        // If it's for forgot password, user must exist. 
        // If it's for registration verification, we might need a different route or check here.
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found with this phone number' });
        }

        const otpCode = generateOTP();
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
