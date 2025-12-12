import mongoose from "mongoose";

const chainEventSchema = new mongoose.Schema(
    {
        // Event Identifier (auto-generated)
        eventId: {
            type: String,
            required: false,
            unique: true,
            uppercase: true,
            default: function () {
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 5).toUpperCase();
                return `EVENT-${timestamp}-${random}`;
            }
        },

        // Related Batch
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductBatch",
            required: true,
        },

        // Event Type
        eventType: {
            type: String,
            required: true,
            enum: [
                "BatchCreated", // Farmer creates batch
                "SupplierPurchase", // Supplier buys from farmer
                "IndustryPurchase", // Industry buys from supplier
                "QualityTest", // Lab test performed
                "Processing", // Processing activity
                "Packaging", // Final packaging
                "ConsumerScan", // Consumer scans QR
            ],
        },

        // Who performed this action
        performedBy: {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "performedBy.userType",
            },
            userType: {
                type: String,
                required: true,
                enum: ["Farmer", "Supplier", "Industry", "Consumer"],
            },
            userName: String,
            userPhone: String,
        },

        // Transaction Details (if applicable)
        transaction: {
            paymentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Payment",
            },
            amount: Number,
            paymentMode: {
                type: String,
                enum: ["UPI", "Cash", "Bank Transfer", "Cheque"],
            },
            paymentStatus: {
                type: String,
                enum: ["pending", "completed", "failed"],
            },
        },

        // Location where event occurred
        location: {
            gpsCoordinates: {
                latitude: Number,
                longitude: Number,
            },
            address: String,
        },

        // Event-specific metadata
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            // Can store any event-specific data
            // For SupplierPurchase: { vehicleNumber, estimatedDelivery }
            // For QualityTest: { testResults, labName }
            // For Processing: { processType, temperature, duration }
        },

        // Verification
        verificationData: {
            verified: {
                type: Boolean,
                default: false,
            },
            verifiedBy: String,
            verificationTimestamp: Date,
            verificationProof: String, // URL to proof document
        },

        // Images/Documents
        attachments: [
            {
                url: String,
                type: {
                    type: String,
                    enum: ["image", "document", "certificate"],
                },
                description: String,
            },
        ],

        // Notes
        notes: {
            type: String,
            maxlength: 500,
        },

        // Timestamp (auto-managed)
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },

        // Status
        status: {
            type: String,
            enum: ["active", "cancelled", "disputed"],
            default: "active",
        },
    },
    { timestamps: true }
);

// Indexes
chainEventSchema.index({ batchId: 1 });
chainEventSchema.index({ eventType: 1 });
chainEventSchema.index({ "performedBy.userId": 1 });
chainEventSchema.index({ timestamp: -1 });

// Generate unique event ID before saving (handled by default function now)
chainEventSchema.pre("save", async function () {
    // eventId is now auto-generated via default function
    // This hook can be used for other pre-save logic if needed
});

const ChainEvent = mongoose.model("ChainEvent", chainEventSchema);

export default ChainEvent;
