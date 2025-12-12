export const DB_NAME = 'herbtrack';

// Test Mode Configuration
// Set to true to enable test mode (skips SMS, allows duplicate phone numbers)
export const TEST_MODE = process.env.TEST_MODE === 'true';

// Test phone number that can be reused across all user types
export const TEST_PHONE_NUMBER = '9999999999';

// Default OTP for test mode (use this when TEST_MODE is true)
export const TEST_OTP = '123456';