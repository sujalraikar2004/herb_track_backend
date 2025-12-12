import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
    {
        batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ProductBatch",
        },
        herbName: String,
        quantity: {
            value: Number,
            unit: String,
        },
        percentage: Number, // % in final product
    },
    { _id: false }
);

const labTestSchema = new mongoose.Schema(
    {
        testName: String,
        labName: String,
        testDate: Date,
        result: String,
        status: {
            type: String,
            enum: ["pass", "fail", "pending"],
        },
        certificateUrl: String,
        testedBy: String,
    },
    { _id: false }
);

const finalProductSchema = new mongoose.Schema(
    {
        // Product Identifier
        productId: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        // Industry who created this product
        industryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Industry",
            required: true,
        },

        // Source Batches (can be multiple herbs combined)
        sourceBatches: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ProductBatch",
                required: true,
            },
        ],

        // Product Details
        productName: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },

        brandName: {
            type: String,
            trim: true,
        },

        productType: {
            type: String,
            enum: [
                "capsule",
                "tablet",
                "powder",
                "syrup",
                "oil",
                "cream",
                "tea",
                "extract",
                "raw",
                "other",
            ],
        },

        category: {
            type: String,
            enum: [
                "ayurvedic",
                "pharmaceutical",
                "cosmetic",
                "food_supplement",
                "herbal_tea",
                "essential_oil",
                "other",
            ],
        },

        // Formulation
        ingredients: [ingredientSchema],

        formulationDetails: {
            type: String,
            maxlength: 2000,
        },

        // Packaging
        packaging: {
            type: {
                type: String,
                enum: ["bottle", "pouch", "box", "jar", "blister", "sachet"],
            },
            material: String,
            quantity: {
                value: Number,
                unit: String, // tablets, ml, grams, etc.
            },
            batchSize: Number, // Number of units in this batch
        },

        // Dates
        manufacturingDate: {
            type: Date,
            required: true,
        },

        expiryDate: {
            type: Date,
            required: true,
        },

        // Lab Tests
        labTests: [labTestSchema],

        // Certifications
        certifications: [
            {
                name: String,
                certificateNumber: String,
                issuedBy: String,
                issuedDate: Date,
                certificateUrl: String,
            },
        ],

        // Regulatory
        fssaiLicense: String,
        drugLicense: String,
        ayushLicense: String,

        // Pricing
        mrp: {
            amount: Number,
            currency: {
                type: String,
                default: "INR",
            },
        },

        // Images
        productImages: [
            {
                url: String,
                type: {
                    type: String,
                    enum: ["front", "back", "side", "ingredients", "usage"],
                },
            },
        ],

        // QR Code for Final Product
        qrCodeURL: {
            type: String,
            required: true,
        },

        qrCodeData: String,

        // Usage Instructions
        dosage: String,
        usageInstructions: String,
        warnings: [String],
        sideEffects: [String],

        // Storage
        storageInstructions: String,

        // Benefits/Claims
        benefits: [String],
        claims: [String],

        // Barcode (if applicable)
        barcode: String,
        sku: String,

        // Distribution
        distributedTo: [
            {
                distributorId: mongoose.Schema.Types.ObjectId,
                distributorName: String,
                quantity: Number,
                date: Date,
            },
        ],

        // Status
        status: {
            type: String,
            enum: ["in_production", "quality_check", "approved", "distributed", "recalled"],
            default: "in_production",
        },

        // Complete Traceability Chain
        traceabilityChain: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ChainEvent",
            },
        ],

        // Metadata
        isActive: {
            type: Boolean,
            default: true,
        },

        totalScans: {
            type: Number,
            default: 0,
        },

        lastScannedAt: Date,
    },
    { timestamps: true }
);

// Indexes
finalProductSchema.index({ industryId: 1 });
finalProductSchema.index({ productName: 1 });
finalProductSchema.index({ status: 1 });

// Generate unique product ID before saving
finalProductSchema.pre("save", async function (next) {
    if (!this.productId) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.productId = `PROD-${timestamp}-${random}`;
    }
    next();
});

const FinalProduct = mongoose.model("FinalProduct", finalProductSchema);

export default FinalProduct;
