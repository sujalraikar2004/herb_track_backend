import jwt from "jsonwebtoken";

/**
 * Generate JWT access token
 * @param {Object} payload - User data to encode
 * @returns {string} - JWT token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - User data to encode
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {boolean} isRefreshToken - Whether it's a refresh token
 * @returns {Object} - Decoded payload
 */
export const verifyToken = (token, isRefreshToken = false) => {
    const secret = isRefreshToken
        ? process.env.JWT_REFRESH_SECRET
        : process.env.JWT_SECRET;
    return jwt.verify(token, secret);
};

/**
 * Generate tokens for user
 * @param {Object} user - User object with id and role
 * @returns {Object} - Access and refresh tokens
 */
export const generateTokens = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        phone: user.phone,
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};
