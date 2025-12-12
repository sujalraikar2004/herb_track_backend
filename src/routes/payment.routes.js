import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    completeCashPayment,
    getPaymentDetails,
    getUserPayments,
} from "../controllers/payment.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/payments/create-order
 * @desc    Create payment order (Razorpay or Cash)
 * @access  Private (Supplier/Industry)
 */
router.post("/create-order", createPaymentOrder);

/**
 * @route   POST /api/v1/payments/verify
 * @desc    Verify Razorpay payment and complete transaction
 * @access  Private
 */
router.post("/verify", verifyPayment);

/**
 * @route   POST /api/v1/payments/cash-payment
 * @desc    Complete cash payment
 * @access  Private
 */
router.post("/cash-payment", completeCashPayment);

/**
 * @route   GET /api/v1/payments/:paymentId
 * @desc    Get payment details
 * @access  Private
 */
router.get("/:paymentId", getPaymentDetails);

/**
 * @route   GET /api/v1/payments/user/:userId
 * @desc    Get all payments for a user (as payer or payee)
 * @access  Private
 */
router.get("/user/:userId", getUserPayments);

export default router;
