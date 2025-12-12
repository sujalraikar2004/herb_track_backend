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
        village: { type: String, trim: true },
        taluk: { type: String, trim: true },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pincode: {
            type: String,
            required: true,
            match: /^[1-9][0-9]{5}$/, // Indian PIN validation
            trim: true,
        },
    },
    { _id: false }
);

const farmerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: /^[6-9]\d{9}$/, // Valid Indian mobile format
        },

        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"],
        },

        aadharNumber: {
            type: String,
            required: [true, "Aadhar number is required"],
            match: /^[0-9]{12}$/, // 12 digit Aadhar
        },

        // Document URLs (uploaded to Cloudinary)
        profileImage: {
            type: String,
            required: [true, "Profile image is required"],
        },

        aadharCardImage: {
            type: String,
            required: [true, "Aadhar card image is required"],
        },

        farmerCertificate: {
            type: String,
            required: [true, "Farmer certificate is required"],
        },

        // Additional documents (optional)
        landDocuments: [
            {
                type: String,
            },
        ],

        address: {
            type: addressSchema,
            required: true,
        },

        farmSize: {
            type: Number, // in acres
            min: 0,
        },

        cropsGrown: [
            {
                type: String,
                trim: true,
            },
        ],

        role: {
            type: String,
            default: "farmer",
            immutable: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isApproved: {
            type: Boolean,
            default: false, // Admin approval required
        },

        otp: otpSchema,

        lastLogin: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked", "pending"],
            default: "pending",
        },

        languagePreference: {
            type: String,
            enum: ["en", "hi", "kn", "mr", "ta", "te"],
            default: "en",
        },
    },
    { timestamps: true }
);

// Index for optimized phone lookup
farmerSchema.index({ phone: 1 });

// Hash OTP before saving
farmerSchema.pre("save", async function () {
    if (this.isModified("otp.code") && this.otp?.code) {
        this.otp.code = await bcrypt.hash(this.otp.code, 10);
    }
});

// Method to compare OTP
farmerSchema.methods.compareOTP = async function (candidateOTP) {
    if (!this.otp?.code) return false;
    return await bcrypt.compare(candidateOTP, this.otp.code);
};

const Farmer = mongoose.model("Farmer", farmerSchema);

export default Farmer;
