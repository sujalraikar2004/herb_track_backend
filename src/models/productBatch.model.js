import mongoose from "mongoose";

const gpsCoordinatesSchema = new mongoose.Schema(
    {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90,
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180,
        },
        accuracy: {
            type: Number, // in meters
        },
    },
    { _id: false }
);

const qualityMetricsSchema = new mongoose.Schema(
    {
        moisture: { type: Number }, // percentage
        purity: { type: Number }, // percentage
        color: { type: String },
        aroma: { type: String },
        grade: {
            type: String,
            enum: ["A+", "A", "B", "C"],
        },
        organicCertified: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);

const productBatchSchema = new mongoose.Schema(
    {
        // Unique batch identifier (auto-generated)
        batchId: {
            type: String,
            required: false,  // Explicitly not required - auto-generated
            unique: true,
            uppercase: true,
            default: function () {
                const timestamp = Date.now().toString(36).toUpperCase();
                const random = Math.random().toString(36).substring(2, 7).toUpperCase();
                return `BATCH-${timestamp}-${random}`;
            }
        },

        // Farmer who created this batch
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farmer",
            required: true,
        },

        // Herb/Crop Details
        herbName: {
            type: String,
            required: [true, "Herb name is required"],
            trim: true,
        },

        scientificName: {
            type: String,
            trim: true,
        },

        category: {
            type: String,
            enum: [
                "root",
                "leaf",
                "flower",
                "seed",
                "bark",
                "fruit",
                "whole_plant",
                "other",
            ],
        },

        // Harvest Information
        harvestDate: {
            type: Date,
            required: [true, "Harvest date is required"],
        },

        quantity: {
            value: {
                type: Number,
                required: true,
                min: 0,
            },
            unit: {
                type: String,
                enum: ["kg", "quintal", "ton", "gram"],
                default: "kg",
            },
        },

        // Location
        gpsCoordinates: {
            type: gpsCoordinatesSchema,
            required: true,
        },

        location: {
            village: String,
            taluk: String,
            district: String,
            state: String,
        },

        // Quality Metrics
        qualityMetrics: qualityMetricsSchema,

        // Images
        images: [
            {
                url: String,
                caption: String,
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Description
        description: {
            type: String,
            maxlength: 1000,
        },

        // QR Code (Auto-generated after creation)
        qrCodeURL: {
            type: String,
        },

        qrCodeData: {
            type: String, // Base64 or URL
        },

        // Current Owner (changes as batch moves through supply chain)
        currentOwner: {
            ownerId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                refPath: "currentOwner.ownerType",
            },
            ownerType: {
                type: String,
                required: true,
                enum: ["Farmer", "Supplier", "Industry"],
            },
            acquiredAt: {
                type: Date,
                default: Date.now,
            },
        },

        // Batch Status
        status: {
            type: String,
            enum: [
                "harvested", // Just created by farmer
                "with_supplier", // Supplier has purchased
                "with_industry", // Industry has purchased
                "processed", // Industry has processed
                "packaged", // Final product created
                "sold", // Sold to consumer
            ],
            default: "harvested",
        },

        // Pricing
        farmerPrice: {
            amount: Number,
            currency: {
                type: String,
                default: "INR",
            },
        },

        // Chain Events Reference
        chainEvents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ChainEvent",
            },
        ],

        // Final Product (if created)
        finalProduct: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FinalProduct",
        },

        // Metadata
        isActive: {
            type: Boolean,
            default: true,
        },

        notes: [
            {
                addedBy: String,
                note: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// Indexes for efficient querying
productBatchSchema.index({ farmerId: 1 });
productBatchSchema.index({ "currentOwner.ownerId": 1 });
productBatchSchema.index({ status: 1 });
productBatchSchema.index({ herbName: 1 });

// Generate unique batch ID before saving
productBatchSchema.pre("save", async function () {
    if (!this.batchId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.batchId = `BATCH-${timestamp}-${random}`;
    }
});

const ProductBatch = mongoose.model("ProductBatch", productBatchSchema);

export default ProductBatch;
