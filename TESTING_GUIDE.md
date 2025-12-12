# Testing Guide - Using Same Phone Number for All Users

## Overview
This guide explains how to test the Ayurvedic Herb Traceability System using the same phone number across different user types (Farmer, Supplier, Industry, Consumer) without encountering errors.

## Test Mode Configuration

### Automatic Test Mode
Test mode is **automatically enabled** when:
- `NODE_ENV=development` (default for local development)
- `TEST_MODE=true` in your `.env` file

### What Test Mode Does
1. **Skips SMS Sending**: No actual SMS is sent via Twilio (saves costs)
2. **Shows OTP in Console**: The OTP is logged in the terminal for easy access
3. **Allows Same Phone Number**: You can use `9999999999` for all user types
4. **No Unique Constraint Issues**: Use the test data generators for unique fields

## Quick Start Testing

### Step 1: Use the Test Phone Number
For all registrations, use: **`9999999999`**

### Step 2: Get OTP from Console
When you register, check your terminal/console output:
```
🧪 TEST MODE: Skipping SMS to +919999999999
🧪 TEST OTP: 456789 (Use this for verification)
```

### Step 3: Use Test Data Generators for Unique Fields

The system provides utilities to generate unique test data for fields that require uniqueness:

#### For Farmer Registration
```javascript
import { TestDataGenerator } from './utils/testDataGenerator.js';

// Generate unique Aadhar number
const aadharNumber = TestDataGenerator.aadhar(); // e.g., "123456780001"
```

#### For Supplier Registration
```javascript
import { TestDataGenerator } from './utils/testDataGenerator.js';

// Generate unique documents
const aadharNumber = TestDataGenerator.aadhar();
const drivingLicense = TestDataGenerator.drivingLicense(); // e.g., "DL-ABC123-XY45"
const vehicleNumber = TestDataGenerator.vehicleNumber(); // e.g., "KA29AB1234"
```

#### For Industry Registration
```javascript
import { TestDataGenerator } from './utils/testDataGenerator.js';

// Generate unique business documents
const email = TestDataGenerator.email('industry'); // e.g., "test.industry.1234567890@herbtrack.test"
const gstNumber = TestDataGenerator.gst(); // e.g., "29ABCDE1234F1Z5"
const panNumber = TestDataGenerator.pan(); // e.g., "ABCDE1234F"
const tradeLicense = TestDataGenerator.tradeLicense(); // e.g., "TL-ABC123-XYZ456"
const aadharNumber = TestDataGenerator.aadhar(); // For authorized person
```

## Testing Workflow

### 1. Register Multiple Users with Same Phone Number

#### Register a Farmer
```bash
POST /api/v1/auth/farmer/register
{
  "name": "Test Farmer",
  "phone": "9999999999",
  "dateOfBirth": "1990-01-01",
  "aadharNumber": "123456780001",  // Use TestDataGenerator.aadhar()
  "profileImage": "url_to_image",
  "aadharCardImage": "url_to_image",
  "farmerCertificate": "url_to_image",
  "address": { ... }
}
```

#### Register a Supplier
```bash
POST /api/v1/auth/supplier/register
{
  "name": "Test Supplier",
  "phone": "9999999999",  // Same phone number!
  "dateOfBirth": "1985-05-15",
  "aadharNumber": "123456780002",  // Different from farmer
  "drivingLicense": {
    "licenseNumber": "DL-ABC123-XY45",  // Use TestDataGenerator.drivingLicense()
    ...
  },
  "vehicles": [...],
  ...
}
```

#### Register an Industry
```bash
POST /api/v1/auth/industry/register
{
  "industryName": "Test Ayurvedic Ltd",
  "phone": "9999999999",  // Same phone number!
  "email": "test.industry.1234567890@herbtrack.test",  // Use TestDataGenerator.email()
  "gstNumber": "29ABCDE1234F1Z5",  // Use TestDataGenerator.gst()
  "panNumber": "ABCDE1234F",  // Use TestDataGenerator.pan()
  "tradeLicense": {
    "licenseNumber": "TL-ABC123-XYZ456",  // Use TestDataGenerator.tradeLicense()
    ...
  },
  ...
}
```

#### Register a Consumer
```bash
POST /api/v1/auth/consumer/register
{
  "phone": "9999999999",  // Same phone number!
  "name": "Test Consumer",
  "email": "test.consumer.1234567890@herbtrack.test"  // Optional
}
```

### 2. Verify OTP
For each registration, use the OTP shown in the console:
```bash
POST /api/v1/auth/{role}/verify-otp
{
  "phone": "9999999999",
  "otp": "456789"  // From console output
}
```

### 3. Login
```bash
POST /api/v1/auth/{role}/login
{
  "phone": "9999999999"
}
```

Then verify with OTP from console.

## Important Notes

### ✅ What Works in Test Mode
- ✅ Same phone number (`9999999999`) for all user types
- ✅ No SMS costs (OTP shown in console)
- ✅ Fast testing without waiting for SMS
- ✅ Multiple registrations without phone conflicts

### ⚠️ What Still Requires Uniqueness
Even in test mode, these fields MUST be unique:
- **Farmer**: `aadharNumber`
- **Supplier**: `aadharNumber`, `drivingLicense.licenseNumber`
- **Industry**: `email`, `gstNumber`, `panNumber`, `tradeLicense.licenseNumber`

**Solution**: Use the `TestDataGenerator` utility to generate unique values!

### 🚫 What Doesn't Work
- ❌ Using the same Aadhar number for multiple users
- ❌ Using the same email for multiple industries
- ❌ Using the same GST/PAN for multiple industries
- ❌ Using the same driving license for multiple suppliers

## Production Mode

### Switching to Production
Set in your `.env`:
```env
NODE_ENV=production
TEST_MODE=false
```

In production mode:
- ✅ Actual SMS will be sent via Twilio
- ✅ Real phone number validation
- ✅ All unique constraints enforced
- ❌ Cannot use same phone number for different users

## Example: Complete Test Flow

```javascript
// 1. Register Farmer
const farmerData = {
  name: "Ravi Kumar",
  phone: "9999999999",
  dateOfBirth: "1990-01-01",
  aadharNumber: TestDataGenerator.aadhar(), // Auto-generated unique
  // ... other fields
};

// 2. Register Supplier (same phone!)
const supplierData = {
  name: "Mohan Transport",
  phone: "9999999999", // Same number
  dateOfBirth: "1985-05-15",
  aadharNumber: TestDataGenerator.aadhar(), // Different unique number
  drivingLicense: {
    licenseNumber: TestDataGenerator.drivingLicense(), // Unique
    // ...
  },
  // ... other fields
};

// 3. Register Industry (same phone!)
const industryData = {
  industryName: "Himalaya Wellness",
  phone: "9999999999", // Same number
  email: TestDataGenerator.email('industry'), // Unique email
  gstNumber: TestDataGenerator.gst(), // Unique GST
  panNumber: TestDataGenerator.pan(), // Unique PAN
  // ... other fields
};

// 4. Register Consumer (same phone!)
const consumerData = {
  phone: "9999999999", // Same number
  name: "Priya Sharma",
  email: TestDataGenerator.email('consumer'), // Unique email
};
```

## Troubleshooting

### Error: "Duplicate key error"
**Cause**: You're using the same value for a unique field (Aadhar, GST, PAN, etc.)
**Solution**: Use `TestDataGenerator` to generate unique values

### Error: "OTP not received"
**Cause**: Check if test mode is enabled
**Solution**: 
1. Check console for `🧪 TEST MODE` message
2. Look for the OTP in terminal output
3. Verify `NODE_ENV=development` in `.env`

### Error: "Phone number already exists"
**Cause**: This shouldn't happen in test mode
**Solution**: 
1. Verify test mode is enabled
2. Check that you're using different user types (not registering same role twice)

## API Testing with Postman

### Environment Variables
Set these in your Postman environment:
```
base_url: http://localhost:8000
test_phone: 9999999999
test_otp: (copy from console)
```

### Collection Structure
```
📁 Ayurvedic Herb Traceability
  📁 Auth
    📁 Farmer
      - Register Farmer
      - Verify OTP
      - Login
    📁 Supplier
      - Register Supplier
      - Verify OTP
      - Login
    📁 Industry
      - Register Industry
      - Verify OTP
      - Login
    📁 Consumer
      - Register Consumer
      - Verify OTP
      - Login
```

## Summary

🎯 **Key Takeaway**: In test mode, you can use `9999999999` for all user types, but you MUST use unique values for Aadhar, GST, PAN, licenses, and emails. Use the `TestDataGenerator` utility to make this easy!

📝 **Best Practice**: 
```javascript
import { TestDataGenerator } from './utils/testDataGenerator.js';

// Always generate unique values for unique fields
const uniqueData = {
  aadhar: TestDataGenerator.aadhar(),
  email: TestDataGenerator.email('farmer'),
  gst: TestDataGenerator.gst(),
  // etc.
};
```

Happy Testing! 🚀
