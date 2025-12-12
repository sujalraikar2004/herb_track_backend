import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        // Payment Identifier
        paymentId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        // Related Batch
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductBatch",
            required: true,
        },

        // Payer (Buyer)
        payer: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "payer.userType",
            },
            userType: {
                type: String,
                required: true,
                enum: ["Supplier", "Industry", "Consumer"],
            },
            name: String,
            phone: String,
        },

        // Payee (Seller)
        payee: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "payee.userType",
            },
            userType: {
                type: String,
                required: true,
                enum: ["Farmer", "Supplier", "Industry"],
            },
            name: String,
            phone: String,
        },

        // Payment Details
        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "INR",
        },

        paymentMode: {
            type: String,
            required: true,
            enum: ["UPI", "Cash", "Bank Transfer", "Cheque", "Razorpay"],
        },

        // Payment Status
        status: {
            type: String,
            required: true,
            enum: ["pending", "processing", "completed", "failed", "refunded"],
            default: "pending",
        },

        // Razorpay Integration
        razorpay: {
            orderId: String, // Razorpay order ID
            paymentId: String, // Razorpay payment ID
            signature: String, // Razorpay signature for verification
        },

        // UPI Details
        upi: {
            transactionId: String,
            upiId: String,
            vpa: String, // Virtual Payment Address
        },

        // Bank Transfer Details
        bankTransfer: {
            transactionId: String,
            bankName: String,
            accountNumber: String,
            ifscCode: String,
        },

        // Cash Payment Details
        cash: {
            receivedBy: String,
            receiptNumber: String,
            witnessName: String,
            witnessPhone: String,
        },

        // Transaction Metadata
        transactionDate: {
            type: Date,
            default: Date.now,
        },

        completedAt: Date,

        failureReason: String,

        // Receipt/Proof
        receipt: {
            url: String,
            generatedAt: Date,
        },

        proofOfPayment: [
            {
                url: String,
                type: String, // screenshot, receipt, etc.
                uploadedAt: Date,
            },
        ],

        // Notes
        notes: {
            type: String,
            maxlength: 500,
        },

        // Verification
        verified: {
            type: Boolean,
            default: false,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "verifiedByType",
        },

        verifiedByType: {
            type: String,
            enum: ["Farmer", "Supplier", "Industry", "Admin"],
        },

        verifiedAt: Date,
    },
    { timestamps: true }
);

// Indexes
paymentSchema.index({ batchId: 1 });
paymentSchema.index({ "payer.userId": 1 });
paymentSchema.index({ "payee.userId": 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionDate: -1 });

// Generate unique payment ID before saving
paymentSchema.pre("save", async function (next) {
    if (!this.paymentId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.paymentId = `PAY-${timestamp}-${random}`;
    }
    next();
});

// Update completedAt when status changes to completed
paymentSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
        this.completedAt = new Date();
    }
    next();
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
