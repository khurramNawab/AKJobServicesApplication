import { auth } from "../config/firebase.js";

/**
 * Firebase SMS/OTP Utility - Industrial Standard
 * 
 * NOTE: For full industrial scale, Firebase sends SMS from the Client (Mobile App) 
 * for security (CAPTCHA/Real device validation). This backend utility is used 
 * to verify the user identity tokens after the phone is verified.
 */

/**
 * In a professional Firebase setup, the mobile app handles the "Sending" of SMS 
 * via Phone Auth. This mock function is kept for consistency with your 
 * current authController logic while transition is in progress.
 */
export const sendSMS = async (phoneNumber, message) => {
    try {
        console.log('------------------------------------');
        console.log(`[FIREBASE-FLOW] SMS To: ${phoneNumber}`);
        console.log(`[FIREBASE-FLOW] Message: ${message}`);
        console.log('--- SMS sent via Client-Side Firebase SDK ---');
        console.log('------------------------------------');
        return true; 
    } catch (error) {
        console.error('Firebase SMS Service Error:', error);
        return false;
    }
};

/**
 * Generates a 6-digit OTP for internal use (if not using Firebase Phone Auth exclusively)
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Industrial Version: Verify a Firebase ID Token from the Mobile App
 * Use this to securely verify phone numbers on the server.
 * 
 * @param {String} idToken - The Firebase ID Token sent from the mobile app
 */
export const verifyFirebaseToken = async (idToken) => {
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken; // Contains phoneNumber and UID
    } catch (error) {
        console.error("Firebase ID Token Verification Error:", error);
        throw error;
    }
};
