import {
    sendOtp,
    generateOTP,
    getOTPExpiry,
    isOTPExpired,
} from "../utils/twilioService.js";
import { generateTokens } from "../utils/jwtHelper.js";
import { getModelByRole, findUserByPhone } from "../utils/modelHelper.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";

// ==================== REGISTRATION ====================

export const registerUser = async (req, res) => {
    try {
        const { role, ...userData } = req.body;

        // Validate role
        const validRoles = ["farmer", "supplier", "industry", "consumer"];
        if (!role || !validRoles.includes(role.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be farmer, supplier, industry, or consumer",
            });
        }

        const { phone } = userData;

        // Check if phone number is provided
        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }


        // Handle file uploads
        const files = req.files;
        if (files) {
            for (const field of Object.keys(files)) {
                const fileArray = files[field];

                // Handle fields that can contain multiple files (e.g., landDocuments)
                if (fileArray.length > 1) {
                    const uploadPromises = fileArray.map(file => uploadonCloudinary(file.path));
                    const results = await Promise.all(uploadPromises);
                    userData[field] = results.map(result => result.secure_url).filter(Boolean);
                }
                // Handle fields with a single file (can be flat or nested)
                else if (fileArray.length === 1) {
                    const file = fileArray[0];
                    const result = await uploadonCloudinary(file.path);

                    if (result && result.secure_url) {
                        // Check for simple nested fields like 'drivingLicense[licenseImage]'
                        const nestedMatch = field.match(/^(\w+)\[(\w+)\]$/);
                        if (nestedMatch) {
                            const parentKey = nestedMatch[1];
                            const childKey = nestedMatch[2];
                            if (!userData[parentKey]) {
                                userData[parentKey] = {};
                            }
                            userData[parentKey][childKey] = result.secure_url;
                        } else {
                            userData[field] = result.secure_url;
                        }
                    }
                }
            }
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        const UserModel = getModelByRole(role);
        // Create new user with correctly structured data
        const newUser = new UserModel({
            ...userData,
            role: role.toLowerCase(),
            otp: {
                code: otp,
                expiresAt: otpExpiry,
            },
            isVerified: false,
        });

        // Validate and save user
        await newUser.validate();
        await newUser.save();

        // Send OTP
        await sendOtp(phone, otp);

        res.status(201).json({
            success: true,
            message: "Registration successful. OTP sent to your phone.",
            data: {
                userId: newUser._id,
                phone: newUser.phone,
                role: newUser.role,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Registration failed",
        });
    }
};

/**
 * Step 2: Verify OTP after registration
 */
export const verifyRegistrationOTP = async (req, res) => {
    try {
        const { phone, otp, role } = req.body;

        if (!phone || !otp || !role) {
            return res.status(400).json({
                success: false,
                message: "Phone number, OTP, and role are required",
            });
        }

        // Get the appropriate model
        const UserModel = getModelByRole(role);

        // Find user
        const user = await UserModel.findOne({ phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User already verified",
            });
        }

        // Check if OTP exists
        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one.",
            });
        }

        // Check if OTP is expired
        console.log('🔍 OTP Verification Debug:');
        console.log('   Current Time:', new Date());
        console.log('   OTP Expiry Time:', user.otp.expiresAt);
        console.log('   Time Difference (ms):', new Date(user.otp.expiresAt) - new Date());
        console.log('   Is Expired?:', isOTPExpired(user.otp.expiresAt));

        if (isOTPExpired(user.otp.expiresAt)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        // Verify OTP
        const isOTPValid = await user.compareOTP(otp);

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Mark user as verified and clear OTP
        user.isVerified = true;
        user.otp = undefined;
        user.lastLogin = new Date();

        // Update status and approval based on role and test mode
        if (role === "consumer") {
            user.status = "active"; // Consumers are active immediately
        } else {
            // In test mode, auto-approve farmers/suppliers/industries
            const { TEST_MODE } = await import("../constants.js");
            if (TEST_MODE) {
                user.status = "active";
                user.isApproved = true;
                console.log(`🧪 TEST MODE: Auto-approved ${role}`);
            } else {
                user.status = "pending"; // Production: need admin approval
                user.isApproved = false;
            }
        }

        await user.save();

        // Generate tokens
        const tokens = generateTokens(user);

        res.status(200).json({
            success: true,
            message: "Phone number verified successfully",
            data: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    isApproved: user.isApproved,
                    status: user.status,
                },
                ...tokens,
            },
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "OTP verification failed",
        });
    }
};

// ==================== LOGIN ====================

/**
 * Step 1: Request OTP for login
 */
export const requestLoginOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        // Find user across all models
        const result = await findUserByPhone(phone);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please register first.",
            });
        }

        const { user, role } = result;

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your phone number first",
            });
        }

        // Check if user is blocked
        if (user.status === "blocked") {
            return res.status(403).json({
                success: false,
                message: "Your account has been blocked. Please contact support.",
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Update user with OTP
        user.otp = {
            code: otp,
            expiresAt: otpExpiry,
        };

        await user.save();

        // Send OTP via Twilio
        await sendOtp(phone, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to your phone number",
            data: {
                phone: user.phone,
                role: user.role,
                otpExpiresAt: otpExpiry,
            },
        });
    } catch (error) {
        console.error("Login OTP request error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to send OTP",
        });
    }
};

/**
 * Step 2: Verify OTP and login
 */
export const verifyLoginOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        // Find user across all models
        const result = await findUserByPhone(phone);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { user, role } = result;

        // Check if OTP exists
        if (!user.otp || !user.otp.code) {
            return res.status(400).json({
                success: false,
                message: "No OTP found. Please request a new one.",
            });
        }

        // Check if OTP is expired
        console.log('🔍 Login OTP Verification Debug:');
        console.log('   Current Time:', new Date());
        console.log('   OTP Expiry Time:', user.otp.expiresAt);
        console.log('   Time Difference (ms):', new Date(user.otp.expiresAt) - new Date());
        console.log('   Is Expired?:', isOTPExpired(user.otp.expiresAt));

        if (isOTPExpired(user.otp.expiresAt)) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        // Verify OTP
        const isOTPValid = await user.compareOTP(otp);

        if (!isOTPValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Update last login and clear OTP
        user.lastLogin = new Date();
        user.otp = undefined;
        await user.save();

        // Generate tokens
        const tokens = generateTokens(user);

        // Prepare user data based on role
        let userData = {
            id: user._id,
            phone: user.phone,
            role: user.role,
            isVerified: user.isVerified,
            status: user.status,
            lastLogin: user.lastLogin,
        };

        // Add role-specific data
        if (role === "farmer") {
            userData = {
                ...userData,
                name: user.name,
                profileImage: user.profileImage,
                isApproved: user.isApproved,
            };
        } else if (role === "supplier") {
            userData = {
                ...userData,
                name: user.name,
                profileImage: user.profileImage,
                isApproved: user.isApproved,
                rating: user.rating,
            };
        } else if (role === "industry") {
            userData = {
                ...userData,
                industryName: user.industryName,
                companyLogo: user.companyLogo,
                isApproved: user.isApproved,
                email: user.email,
            };
        } else if (role === "consumer") {
            userData = {
                ...userData,
                name: user.name,
                profileImage: user.profileImage,
            };
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: userData,
                ...tokens,
            },
        });
    } catch (error) {
        console.error("Login verification error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Login failed",
        });
    }
};

// ==================== RESEND OTP ====================

/**
 * Resend OTP (works for both registration and login)
 */
export const resendOTP = async (req, res) => {
    try {
        const { phone, role } = req.body;

        if (!phone) {
            return res.status(400).json({
                success: false,
                message: "Phone number is required",
            });
        }

        let user;
        let userRole;

        if (role) {
            // If role is provided, search in specific model
            const UserModel = getModelByRole(role);
            user = await UserModel.findOne({ phone });
            userRole = role;
        } else {
            // Search across all models
            const result = await findUserByPhone(phone);
            if (result) {
                user = result.user;
                userRole = result.role;
            }
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Update user with new OTP
        user.otp = {
            code: otp,
            expiresAt: otpExpiry,
        };

        await user.save();

        // Send OTP via Twilio
        await sendOtp(phone, otp);

        res.status(200).json({
            success: true,
            message: "OTP resent successfully",
            data: {
                phone: user.phone,
                role: userRole,
                otpExpiresAt: otpExpiry,
            },
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to resend OTP",
        });
    }
};
