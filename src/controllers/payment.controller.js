import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import ProductBatch from "../models/productBatch.model.js";
import ChainEvent from "../models/chainEvent.model.js";
import Farmer from "../models/farmer.model.js";
import Supplier from "../models/supplier.model.js";
import Industry from "../models/industry.model.js";
import {
    createRazorpayOrder,
    verifyRazorpaySignature,
    fetchPaymentDetails,
} from "../utils/razorpayService.js";

// ==================== CREATE PAYMENT ORDER ====================

/**
 * Create payment order (Razorpay or Cash)
 * POST /api/v1/payments/create-order
 */
export const createPaymentOrder = async (req, res) => {
    try {
        const {
            batchId,
            payerId,
            payerType, // Supplier or Industry
            amount,
            paymentMode, // Razorpay, Cash, UPI, Bank Transfer
        } = req.body;

        // Validate batch
        const batch = await ProductBatch.findById(batchId);
        if (!batch) {
            return res.status(404).json({
                success: false,
                message: "Batch not found",
            });
        }

        // Get current owner (seller)
        const payeeId = batch.currentOwner.ownerId;
        const payeeType = batch.currentOwner.ownerType;

        // ✨ IMPROVEMENT 1: IDEMPOTENCY - Check for existing payment
        const existingPayment = await Payment.findOne({
            batchId,
            "payer.userId": payerId,
            status: { $in: ["pending", "completed"] }
        });

        if (existingPayment) {
            console.log('⚠️ Payment already exists, returning existing order');

            // If Razorpay and order exists, return it
            if (existingPayment.paymentMode === "Razorpay" && existingPayment.razorpay.orderId) {
                return res.status(200).json({
                    success: true,
                    message: "Payment order already exists",
                    data: {
                        payment: existingPayment,
                        razorpayOrder: {
                            id: existingPayment.razorpay.orderId,
                            amount: existingPayment.amount,
                            currency: "INR",
                            key_id: process.env.RAZORPAY_KEY_ID
                        }
                    }
                });
            }

            // For cash/other modes, just return existing payment
            return res.status(200).json({
                success: true,
                message: "Payment already exists",
                data: { payment: existingPayment }
            });
        }

        // Validate payer exists
        let payer;
        if (payerType === "Supplier") {
            payer = await Supplier.findById(payerId);
        } else if (payerType === "Industry") {
            payer = await Industry.findById(payerId);
        }

        if (!payer) {
            return res.status(404).json({
                success: false,
                message: `${payerType} not found`,
            });
        }

        // Get payee details
        let payee;
        if (payeeType === "Farmer") {
            payee = await Farmer.findById(payeeId);
        } else if (payeeType === "Supplier") {
            payee = await Supplier.findById(payeeId);
        }

        // Create payment record
        const payment = new Payment({
            batchId,
            payer: {
                userId: payerId,
                userType: payerType,
                name: payer.name || payer.industryName,
                phone: payer.phone,
            },
            payee: {
                userId: payeeId,
                userType: payeeType,
                name: payee.name || payee.industryName,
                phone: payee.phone,
            },
            amount,
            paymentMode,
            status: "pending",
        });

        await payment.save();

        // If Razorpay, create order
        let razorpayOrder = null;
        if (paymentMode === "Razorpay") {
            razorpayOrder = await createRazorpayOrder(amount, payment.paymentId, {
                batchId: batch.batchId,
                payerId,
                payeeId,
            });

            payment.razorpay.orderId = razorpayOrder.id;
            await payment.save();
        }

        res.status(201).json({
            success: true,
            message: "Payment order created",
            data: {
                payment,
                razorpayOrder,
            },
        });
    } catch (error) {
        console.error("Create payment order error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order",
        });
    }
};

// ==================== VERIFY AND COMPLETE PAYMENT ====================

/**
 * Verify Razorpay payment and complete transaction
 * POST /api/v1/payments/verify
 */
export const verifyPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            paymentId, // Our payment ID
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        // Find payment
        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        // ✨ IMPROVEMENT 2: ALREADY VERIFIED CHECK - Prevent re-processing
        if (payment.status === "completed") {
            console.log('⚠️ Payment already verified and processed');
            return res.status(200).json({
                success: true,
                message: "Payment already verified and processed",
                data: { payment }
            });
        }

        // Verify signature
        const isValid = verifyRazorpaySignature(
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature
        );

        if (!isValid) {
            payment.status = "failed";
            payment.failureReason = "Invalid signature";
            await payment.save();

            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // ✨ IMPROVEMENT 3: DATABASE TRANSACTION - Atomic operations
        session.startTransaction();
        console.log('🔄 Starting transaction for payment verification');

        // Update payment
        payment.status = "completed";
        payment.razorpay.paymentId = razorpayPaymentId;
        payment.razorpay.signature = razorpaySignature;
        payment.completedAt = new Date();
        await payment.save({ session });

        // Update batch ownership
        const batch = await ProductBatch.findById(payment.batchId).session(session);
        if (!batch) {
            throw new Error("Batch not found");
        }

        batch.currentOwner = {
            ownerId: payment.payer.userId,
            ownerType: payment.payer.userType,
            acquiredAt: new Date(),
        };

        // Update batch status
        if (payment.payer.userType === "Supplier") {
            batch.status = "with_supplier";
        } else if (payment.payer.userType === "Industry") {
            batch.status = "with_industry";
        }

        await batch.save({ session });

        // Create chain event
        const eventType =
            payment.payer.userType === "Supplier"
                ? "SupplierPurchase"
                : "IndustryPurchase";

        const chainEvent = new ChainEvent({
            batchId: batch._id,
            eventType,
            performedBy: {
                userId: payment.payer.userId,
                userType: payment.payer.userType,
                userName: payment.payer.name,
                userPhone: payment.payer.phone,
            },
            transaction: {
                paymentId: payment._id,
                amount: payment.amount,
                paymentMode: payment.paymentMode,
                paymentStatus: "completed",
            },
            metadata: {
                previousOwner: payment.payee.name,
                amountPaid: payment.amount,
                paymentMode: payment.paymentMode,
            },
            timestamp: new Date(),
        });

        await chainEvent.save({ session });

        // Add event to batch
        batch.chainEvents.push(chainEvent._id);
        await batch.save({ session });

        // ✅ Commit transaction
        await session.commitTransaction();
        console.log('✅ Transaction committed successfully');

        res.status(200).json({
            success: true,
            message: "Payment verified and ownership transferred",
            data: {
                payment,
                batch,
                chainEvent,
            },
        });
    } catch (error) {
        // ❌ Rollback on error
        await session.abortTransaction();
        console.error("❌ Transaction aborted - Verify payment error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Payment verification failed",
        });
    } finally {
        session.endSession();
    }
};

// ==================== COMPLETE CASH PAYMENT ====================

/**
 * Complete cash payment
 * POST /api/v1/payments/cash-payment
 */
export const completeCashPayment = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        const {
            paymentId,
            receivedBy,
            receiptNumber,
            witnessName,
            witnessPhone,
            proofImages,
        } = req.body;

        // Find payment
        const payment = await Payment.findOne({ paymentId });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        if (payment.paymentMode !== "Cash") {
            return res.status(400).json({
                success: false,
                message: "This is not a cash payment",
            });
        }

        // ✨ IMPROVEMENT 2: ALREADY COMPLETED CHECK
        if (payment.status === "completed") {
            console.log('⚠️ Cash payment already completed');
            return res.status(200).json({
                success: true,
                message: "Cash payment already completed",
                data: { payment }
            });
        }

        // ✨ IMPROVEMENT 3: DATABASE TRANSACTION
        session.startTransaction();
        console.log('🔄 Starting transaction for cash payment completion');

        // Update payment
        payment.status = "completed";
        payment.cash = {
            receivedBy,
            receiptNumber,
            witnessName,
            witnessPhone,
        };

        if (proofImages) {
            payment.proofOfPayment = proofImages.map((url) => ({
                url,
                type: "receipt",
                uploadedAt: new Date(),
            }));
        }

        payment.completedAt = new Date();
        await payment.save({ session });

        // Update batch ownership
        const batch = await ProductBatch.findById(payment.batchId).session(session);
        if (!batch) {
            throw new Error("Batch not found");
        }

        batch.currentOwner = {
            ownerId: payment.payer.userId,
            ownerType: payment.payer.userType,
            acquiredAt: new Date(),
        };

        if (payment.payer.userType === "Supplier") {
            batch.status = "with_supplier";
        } else if (payment.payer.userType === "Industry") {
            batch.status = "with_industry";
        }

        await batch.save({ session });

        // Create chain event
        const eventType =
            payment.payer.userType === "Supplier"
                ? "SupplierPurchase"
                : "IndustryPurchase";

        const chainEvent = new ChainEvent({
            batchId: batch._id,
            eventType,
            performedBy: {
                userId: payment.payer.userId,
                userType: payment.payer.userType,
                userName: payment.payer.name,
                userPhone: payment.payer.phone,
            },
            transaction: {
                paymentId: payment._id,
                amount: payment.amount,
                paymentMode: "Cash",
                paymentStatus: "completed",
            },
            metadata: {
                previousOwner: payment.payee.name,
                amountPaid: payment.amount,
                paymentMode: "Cash",
                receivedBy,
                witnessName,
            },
            timestamp: new Date(),
        });

        await chainEvent.save({ session });

        batch.chainEvents.push(chainEvent._id);
        await batch.save({ session });

        // ✅ Commit transaction
        await session.commitTransaction();
        console.log('✅ Transaction committed successfully');

        res.status(200).json({
            success: true,
            message: "Cash payment completed and ownership transferred",
            data: {
                payment,
                batch,
                chainEvent,
            },
        });
    } catch (error) {
        // ❌ Rollback on error
        await session.abortTransaction();
        console.error("❌ Transaction aborted - Complete cash payment error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to complete cash payment",
        });
    } finally {
        session.endSession();
    }
};

// ==================== GET PAYMENT DETAILS ====================

/**
 * Get payment details
 * GET /api/v1/payments/:paymentId
 */
export const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findOne({ paymentId })
            .populate("batchId")
            .populate("payer.userId")
            .populate("payee.userId");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            data: { payment },
        });
    } catch (error) {
        console.error("Get payment error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payment",
        });
    }
};

// ==================== GET USER PAYMENTS ====================

/**
 * Get all payments for a user (as payer or payee)
 * GET /api/v1/payments/user/:userId
 */
export const getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { type = "all", page = 1, limit = 10 } = req.query;

        let query = {};

        if (type === "sent") {
            query["payer.userId"] = userId;
        } else if (type === "received") {
            query["payee.userId"] = userId;
        } else {
            query.$or = [{ "payer.userId": userId }, { "payee.userId": userId }];
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("batchId", "batchId herbName");

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                payments,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total,
            },
        });
    } catch (error) {
        console.error("Get user payments error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payments",
        });
    }
};
