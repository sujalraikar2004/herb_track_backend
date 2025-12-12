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
        street: { type: String, trim: true },
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

const vehicleSchema = new mongoose.Schema(
    {
        vehicleNumber: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        vehicleType: {
            type: String,
            enum: ["bike", "auto", "van", "truck", "tempo"],
            required: true,
        },
        rcBookImage: {
            type: String,
            required: true,
        },
    },
    { _id: false }
);

const supplierSchema = new mongoose.Schema(
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
            match: /^[6-9]\d{9}$/,
        },

        dateOfBirth: {
            type: Date,
            required: [true, "Date of birth is required"],
        },

        profileImage: {
            type: String,
            required: [true, "Profile image is required"],
        },

        // Driver's License
        drivingLicense: {
            licenseNumber: {
                type: String,
                required: true,
                unique: true,
                uppercase: true,
                trim: true,
            },
            licenseImage: {
                type: String,
                required: true,
            },
            expiryDate: {
                type: Date,
                required: true,
            },
        },

        // Vehicle Information
        vehicles: {
            type: [vehicleSchema],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: "At least one vehicle is required",
            },
        },

        // Aadhar for identity
        aadharNumber: {
            type: String,
            required: true,
            unique: true,
            match: /^[0-9]{12}$/,
        },

        aadharCardImage: {
            type: String,
            required: true,
        },

        address: {
            type: addressSchema,
            required: true,
        },

        // Business details (optional for individual suppliers)
        businessName: {
            type: String,
            trim: true,
        },

        gstNumber: {
            type: String,
            trim: true,
            uppercase: true,
            match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
        },

        role: {
            type: String,
            default: "supplier",
            immutable: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isApproved: {
            type: Boolean,
            default: false,
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

        // Delivery statistics
        totalDeliveries: {
            type: Number,
            default: 0,
        },

        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },

        languagePreference: {
            type: String,
            enum: ["en", "hi", "kn", "mr", "ta", "te"],
            default: "en",
        },
    },
    { timestamps: true }
);

// Indexes
supplierSchema.index({ phone: 1 });

// Hash OTP before saving
supplierSchema.pre("save", async function () {
    if (this.isModified("otp.code") && this.otp?.code) {
        this.otp.code = await bcrypt.hash(this.otp.code, 10);
    }
});

// Method to compare OTP
supplierSchema.methods.compareOTP = async function (candidateOTP) {
    if (!this.otp?.code) return false;
    return await bcrypt.compare(candidateOTP, this.otp.code);
};

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;
