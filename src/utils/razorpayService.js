import Razorpay from "razorpay";
import crypto from "crypto";

export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order
 * @param {number} amount - Amount in INR
 * @param {string} receipt - Receipt ID
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} - Razorpay order
 */
export const createRazorpayOrder = async (amount, receipt, notes = {}) => {
    try {
        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: "INR",
            receipt: receipt,
            notes: notes,
        };

        const order = await razorpayInstance.orders.create(options);
        return order;
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        throw new Error("Failed to create payment order");
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} - True if signature is valid
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    try {
        const text = `${orderId}|${paymentId}`;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        return generated_signature === signature;
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} - Payment details
 */
export const fetchPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw new Error("Failed to fetch payment details");
    }
};

/**
 * Create refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not provided)
 * @returns {Promise<object>} - Refund details
 */
export const createRefund = async (paymentId, amount = null) => {
    try {
        const options = amount ? { amount: amount * 100 } : {};
        const refund = await razorpayInstance.payments.refund(paymentId, options);
        return refund;
    } catch (error) {
        console.error("Error creating refund:", error);
        throw new Error("Failed to create refund");
    }
};
