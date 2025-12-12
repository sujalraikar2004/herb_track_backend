import twilio from "twilio";
import { TEST_MODE, TEST_OTP } from "../constants.js";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP via SMS using Twilio
 * @param {string} phoneNumber - 10 digit Indian phone number
 * @param {string} otp - 6 digit OTP
 * @returns {Promise} - Twilio message object
 */
export const sendOtp = async (phoneNumber, otp) => {
    try {
        // In test mode, skip actual SMS sending
        if (TEST_MODE) {
            console.log(`🧪 TEST MODE: Skipping SMS to +91${phoneNumber}`);
            console.log(`🧪 TEST OTP: ${otp} (Use this for verification)`);
            return {
                sid: 'TEST_MESSAGE_SID',
                status: 'test',
                to: `+91${phoneNumber}`,
                body: `Your verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`
            };
        }

        // Production mode: Send actual SMS
        const message = await client.messages.create({
            body: `Your verification code is ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: `+91${phoneNumber}`,
        });

        console.log(`✅ OTP sent successfully to +91${phoneNumber}`);
        return message;
    } catch (error) {
        console.error("❌ Error sending OTP:", error.message);
        throw new Error("Failed to send OTP. Please try again.");
    }
};

/**
 * Generate a 6-digit OTP
 * @returns {string} - 6 digit OTP
 */
export const generateOTP = () => {
    if (TEST_MODE) {
        return TEST_OTP;
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get OTP expiry time (30 minutes from now for testing, 10 minutes in production)
 * @returns {Date} - Expiry date
 */
export const getOTPExpiry = () => {
    const minutes = TEST_MODE ? 30 : 10; // 30 minutes in test mode, 10 in production
    return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Check if OTP is expired
 * @param {Date} expiryDate - OTP expiry date
 * @returns {boolean} - true if expired
 */
export const isOTPExpired = (expiryDate) => {
    return new Date() > new Date(expiryDate);
};
