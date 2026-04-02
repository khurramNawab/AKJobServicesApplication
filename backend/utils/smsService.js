/**
 * SMS/OTP Utility - Standard
 * 
 * This service currently uses a mock flow for development.
 * For industrial use, integrate Twilio, MSG91 or similar.
 */

export const sendSMS = async (phoneNumber, message) => {
    try {
        console.log('------------------------------------');
        console.log(`[SMS-FLOW] To: ${phoneNumber}`);
        console.log(`[SMS-FLOW] Message: ${message}`);
        console.log('--- SMS sent (Mock) ---');
        console.log('------------------------------------');
        return true; 
    } catch (error) {
        console.error('SMS Service Error:', error);
        return false;
    }
};

/**
 * Generates a 6-digit OTP for internal use
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
