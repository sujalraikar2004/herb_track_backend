import express from "express";
import {
    registerUser,
    verifyRegistrationOTP,
    requestLoginOTP,
    verifyLoginOTP,
    resendOTP,
} from "../controllers/auth.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

// ==================== REGISTRATION ROUTES ====================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user (farmer/supplier/industry/consumer)
 * @access  Public
 * @body    { role, phone, ...other fields based on role }
 */
router.post(
    "/register",
    upload.fields([
        // Common
        { name: "profileImage", maxCount: 1 },
        { name: "aadharCardImage", maxCount: 1 },

        // Farmer
        { name: "farmerCertificate", maxCount: 1 },
        { name: "landDocuments", maxCount: 5 },

        // Supplier
        { name: "drivingLicense[licenseImage]", maxCount: 1 },
        { name: "vehicles[0][rcBookImage]", maxCount: 1 }, // Example for one vehicle

        // Industry
        { name: "companyLogo", maxCount: 1 },
        { name: "gstCertificate", maxCount: 1 },
        { name: "panCardImage", maxCount: 1 },
        { name: "tradeLicense[licenseImage]", maxCount: 1 },
        { name: "authorizedPerson[aadharCardImage]", maxCount: 1 },
        { name: "factoryImages", maxCount: 10 },
    ]),
    registerUser
);

/**
 * @route   POST /api/v1/auth/verify-registration
 * @desc    Verify OTP sent during registration
 * @access  Public
 * @body    { phone, otp, role }
 */
router.post("/verify-registration", verifyRegistrationOTP);

// ==================== LOGIN ROUTES ====================

/**
 * @route   POST /api/v1/auth/login
 * @desc    Request OTP for login
 * @access  Public
 * @body    { phone }
 */
router.post("/login", requestLoginOTP);

/**
 * @route   POST /api/v1/auth/verify-login
 * @desc    Verify OTP and complete login
 * @access  Public
 * @body    { phone, otp }
 */
router.post("/verify-login", verifyLoginOTP);

// ==================== OTP ROUTES ====================

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP (for both registration and login)
 * @access  Public
 * @body    { phone, role? }
 */
router.post("/resend-otp", resendOTP);

export default router;
