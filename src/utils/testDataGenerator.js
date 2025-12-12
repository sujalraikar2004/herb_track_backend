import { TEST_MODE } from "../constants.js";

/**
 * Generate unique test data for fields that require uniqueness
 * This helps avoid duplicate key errors when testing with same phone number
 */

let testCounter = 1;

/**
 * Generate a unique Aadhar number for testing
 * @returns {string} - 12 digit Aadhar number
 */
export const generateTestAadhar = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const timestamp = Date.now().toString().slice(-8);
    const counter = testCounter.toString().padStart(4, '0');
    testCounter++;
    return timestamp + counter;
};

/**
 * Generate a unique driving license number for testing
 * @returns {string} - Driving license number
 */
export const generateTestDrivingLicense = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `DL-${timestamp}-${random}`;
};

/**
 * Generate a unique GST number for testing
 * @returns {string} - GST number
 */
export const generateTestGST = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const stateCode = "29"; // Karnataka
    const pan = generateTestPAN();
    const entityNumber = Math.floor(1000 + Math.random() * 9000);
    const defaultChecksum = "Z";
    const checkDigit = Math.floor(Math.random() * 10);

    return `${stateCode}${pan}${entityNumber}${defaultChecksum}${checkDigit}`;
};

/**
 * Generate a unique PAN number for testing
 * @returns {string} - PAN number
 */
export const generateTestPAN = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const letters1 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const letters2 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const letters3 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const letters4 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const letters5 = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(1000 + Math.random() * 9000);
    const lastLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    return `${letters1}${letters2}${letters3}${letters4}${letters5}${numbers}${lastLetter}`;
};

/**
 * Generate a unique trade license number for testing
 * @returns {string} - Trade license number
 */
export const generateTestTradeLicense = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TL-${timestamp}-${random}`;
};

/**
 * Generate a unique email for testing
 * @param {string} role - User role (farmer, supplier, industry, consumer)
 * @returns {string} - Email address
 */
export const generateTestEmail = (role = 'user') => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const timestamp = Date.now();
    return `test.${role}.${timestamp}@herbtrack.test`;
};

/**
 * Generate a unique vehicle number for testing
 * @returns {string} - Vehicle registration number
 */
export const generateTestVehicleNumber = () => {
    if (!TEST_MODE) {
        throw new Error("This function should only be used in TEST_MODE");
    }
    const stateCode = "KA"; // Karnataka
    const districtCode = Math.floor(10 + Math.random() * 90);
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const numbers = Math.floor(1000 + Math.random() * 9000);

    return `${stateCode}${districtCode}${letters}${numbers}`;
};

/**
 * Reset the test counter (useful for testing)
 */
export const resetTestCounter = () => {
    testCounter = 1;
};

// Export all generators as a single object for convenience
export const TestDataGenerator = {
    aadhar: generateTestAadhar,
    drivingLicense: generateTestDrivingLicense,
    gst: generateTestGST,
    pan: generateTestPAN,
    tradeLicense: generateTestTradeLicense,
    email: generateTestEmail,
    vehicleNumber: generateTestVehicleNumber,
    reset: resetTestCounter
};
