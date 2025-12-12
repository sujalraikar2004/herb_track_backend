import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema(
    {
        code: { type: String },
        expiresAt: { type: Date },
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        buildingName: { type: String, trim: true },
        street: { type: String, required: true, trim: true },
        area: { type: String, trim: true },
        city: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: {
            type: String,
            required: true,
            match: /^[1-9][0-9]{5}$/,
            trim: true,
        },
    },
    { _id: false }
);

const industrySchema = new mongoose.Schema(
    {
        // Business Information
        industryName: {
            type: String,
            required: [true, "Industry name is required"],
            trim: true,
            minlength: 2,
            maxlength: 200,
        },

        industryType: {
            type: String,
            required: true,
            enum: [
                "pharmaceutical",
                "ayurvedic",
                "cosmetics",
                "food_processing",
                "herbal_products",
                "research",
                "other",
            ],
        },

        yearEstablished: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear(),
        },

        // Contact Information
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: /^[6-9]\d{9}$/,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },

        website: {
            type: String,
            trim: true,
        },

        // Authorized Person Details
        authorizedPerson: {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            designation: {
                type: String,
                required: true,
                trim: true,
            },
            phone: {
                type: String,
                required: true,
                match: /^[6-9]\d{9}$/,
            },
            email: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            aadharNumber: {
                type: String,
                required: true,
                match: /^[0-9]{12}$/,
            },
            aadharCardImage: {
                type: String,
                required: true,
            },
        },

        // Legal Documents
        gstNumber: {
            type: String,
            required: [true, "GST number is required"],
            unique: true,
            uppercase: true,
            trim: true,
            match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        },

        gstCertificate: {
            type: String,
            required: [true, "GST certificate is required"],
        },

        panNumber: {
            type: String,
            required: [true, "PAN number is required"],
            unique: true,
            uppercase: true,
            trim: true,
            match: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        },

        panCardImage: {
            type: String,
            required: [true, "PAN card image is required"],
        },

        tradeLicense: {
            licenseNumber: {
                type: String,
                required: true,
                unique: true,
                trim: true,
            },
            licenseImage: {
                type: String,
                required: true,
            },
            issueDate: {
                type: Date,
                required: true,
            },
            expiryDate: {
                type: Date,
                required: true,
            },
        },

        // Additional Certifications (optional but recommended)
        fssaiLicense: {
            licenseNumber: {
                type: String,
                trim: true,
            },
            licenseImage: {
                type: String,
            },
            expiryDate: {
                type: Date,
            },
        },

        drugLicense: {
            licenseNumber: {
                type: String,
                trim: true,
            },
            licenseImage: {
                type: String,
            },
            expiryDate: {
                type: Date,
            },
        },

        // ISO or other certifications
        certifications: [
            {
                name: String,
                certificateNumber: String,
                certificateImage: String,
                issueDate: Date,
                expiryDate: Date,
            },
        ],

        // Company Logo and Images
        companyLogo: {
            type: String,
            required: [true, "Company logo is required"],
        },

        factoryImages: [
            {
                type: String,
            },
        ],

        address: {
            type: addressSchema,
            required: true,
        },

        // Bank Details (for transactions)
        bankDetails: {
            accountHolderName: {
                type: String,
                trim: true,
            },
            accountNumber: {
                type: String,
                trim: true,
            },
            ifscCode: {
                type: String,
                uppercase: true,
                trim: true,
            },
            bankName: {
                type: String,
                trim: true,
            },
            branchName: {
                type: String,
                trim: true,
            },
        },

        // Capacity and Operations
        productionCapacity: {
            value: Number,
            unit: String, // e.g., "tons/month", "kg/day"
        },

        employeeCount: {
            type: Number,
            min: 1,
        },

        role: {
            type: String,
            default: "industry",
            immutable: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isApproved: {
            type: Boolean,
            default: false, // Requires thorough admin verification
        },

        otp: otpSchema,

        lastLogin: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked", "pending", "under_review"],
            default: "pending",
        },

        // Compliance and ratings
        complianceScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        totalOrders: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes
industrySchema.index({ phone: 1 });

// Hash OTP before saving
industrySchema.pre("save", async function () {
    if (this.isModified("otp.code") && this.otp?.code) {
        this.otp.code = await bcrypt.hash(this.otp.code, 10);
    }
});

// Method to compare OTP
industrySchema.methods.compareOTP = async function (candidateOTP) {
    if (!this.otp?.code) return false;
    return await bcrypt.compare(candidateOTP, this.otp.code);
};

const Industry = mongoose.model("Industry", industrySchema);

export default Industry;
