import mongoose from "mongoose";
import bcrypt from "bcrypt";

const otpSchema = new mongoose.Schema(
    {
        code: { type: String },
        expiresAt: { type: Date },
    },
    { _id: false }
);

const consumerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            match: /^[6-9]\d{9}$/,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },

        profileImage: {
            type: String,
            default: "https://res.cloudinary.com/dummy/defaults/consumer_avatar.png",
        },

        role: {
            type: String,
            default: "consumer",
            immutable: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        otp: otpSchema,

        lastLogin: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "blocked"],
            default: "active",
        },

        // Consumer preferences
        languagePreference: {
            type: String,
            enum: ["en", "hi", "kn", "mr", "ta", "te"],
            default: "en",
        },

        // Scan history for QR codes
        scanHistory: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                scannedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // Saved/favorite products
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
    },
    { timestamps: true }
);

// Index
consumerSchema.index({ phone: 1 });

// Hash OTP before saving
consumerSchema.pre("save", async function () {
    if (this.isModified("otp.code") && this.otp?.code) {
        this.otp.code = await bcrypt.hash(this.otp.code, 10);
    }
});

// Method to compare OTP
consumerSchema.methods.compareOTP = async function (candidateOTP) {
    if (!this.otp?.code) return false;
    return await bcrypt.compare(candidateOTP, this.otp.code);
};

const Consumer = mongoose.model("Consumer", consumerSchema);

export default Consumer;
