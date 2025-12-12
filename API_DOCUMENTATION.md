# 🔐 Authentication API Documentation

This document describes all authentication endpoints for the Herbal Supply Chain Tracking System.

## Base URL
```
http://localhost:8000/api/v1/auth
```

---

## 📋 Table of Contents
1. [Registration Flow](#registration-flow)
2. [Login Flow](#login-flow)
3. [OTP Management](#otp-management)
4. [Role-Specific Registration Data](#role-specific-registration-data)

---

## 🎯 Registration Flow

### 1. Register User
**Endpoint:** `POST /register`

**Description:** Register a new user (Farmer/Supplier/Industry/Consumer) and send OTP to phone number.

**Request Body:**
```json
{
  "role": "farmer|supplier|industry|consumer",
  "phone": "9876543210",
  ...other fields based on role
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your phone number.",
  "data": {
    "userId": "64f5a1b2c3d4e5f6g7h8i9j0",
    "phone": "9876543210",
    "role": "farmer",
    "otpExpiresAt": "2025-12-11T17:45:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation failed / Invalid role
- `409` - User already exists
- `500` - Server error

---

### 2. Verify Registration OTP
**Endpoint:** `POST /verify-registration`

**Description:** Verify the OTP sent during registration to complete account activation.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "role": "farmer"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "user": {
      "id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "phone": "9876543210",
      "role": "farmer",
      "isVerified": true,
      "isApproved": false,
      "status": "pending"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid/Expired OTP / Already verified
- `404` - User not found
- `500` - Server error

---

## 🔑 Login Flow

### 1. Request Login OTP
**Endpoint:** `POST /login`

**Description:** Request OTP for login (sent to registered phone number).

**Request Body:**
```json
{
  "phone": "9876543210"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "data": {
    "phone": "9876543210",
    "role": "farmer",
    "otpExpiresAt": "2025-12-11T17:45:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Phone number required
- `403` - User not verified / Account blocked
- `404` - User not found
- `500` - Server error

---

### 2. Verify Login OTP
**Endpoint:** `POST /verify-login`

**Description:** Verify OTP and complete login.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "phone": "9876543210",
      "role": "farmer",
      "name": "John Doe",
      "profileImage": "https://...",
      "isVerified": true,
      "isApproved": true,
      "status": "active",
      "lastLogin": "2025-12-11T16:35:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid/Expired OTP
- `404` - User not found
- `500` - Server error

---

## 🔄 OTP Management

### Resend OTP
**Endpoint:** `POST /resend-otp`

**Description:** Resend OTP (works for both registration and login).

**Request Body:**
```json
{
  "phone": "9876543210",
  "role": "farmer"  // Optional - if not provided, will search all models
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP resent successfully",
  "data": {
    "phone": "9876543210",
    "role": "farmer",
    "otpExpiresAt": "2025-12-11T17:45:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Phone number required
- `404` - User not found
- `500` - Server error

---

## 📝 Role-Specific Registration Data

### 👨‍🌾 Farmer Registration
```json
{
  "role": "farmer",
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "dateOfBirth": "1985-05-15",
  "aadharNumber": "123456789012",
  "profileImage": "base64_or_url",
  "aadharCardImage": "base64_or_url",
  "farmerCertificate": "base64_or_url",
  "landDocuments": ["base64_or_url"],  // Optional
  "address": {
    "village": "Kothapalli",
    "taluk": "Somwarpet",
    "district": "Kodagu",
    "state": "Karnataka",
    "pincode": "571236"
  },
  "farmSize": 5.5,  // in acres, optional
  "cropsGrown": ["Ashwagandha", "Tulsi", "Neem"]  // Optional
}
```

### 🚚 Supplier Registration
```json
{
  "role": "supplier",
  "name": "Suresh Patil",
  "phone": "9876543211",
  "dateOfBirth": "1990-08-20",
  "profileImage": "base64_or_url",
  "drivingLicense": {
    "licenseNumber": "KA0120210012345",
    "licenseImage": "base64_or_url",
    "expiryDate": "2030-08-20"
  },
  "vehicles": [
    {
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "truck",
      "rcBookImage": "base64_or_url"
    }
  ],
  "aadharNumber": "123456789013",
  "aadharCardImage": "base64_or_url",
  "address": {
    "street": "MG Road",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "businessName": "Patil Transport Services",  // Optional
  "gstNumber": "29ABCDE1234F1Z5"  // Optional
}
```

### 🏭 Industry Registration
```json
{
  "role": "industry",
  "industryName": "Himalaya Wellness Company",
  "industryType": "ayurvedic",
  "yearEstablished": 1930,
  "phone": "9876543212",
  "email": "contact@himalayawellness.com",
  "website": "https://himalayawellness.com",
  "authorizedPerson": {
    "name": "Dr. Mehra",
    "designation": "Managing Director",
    "phone": "9876543213",
    "email": "mehra@himalayawellness.com",
    "aadharNumber": "123456789014",
    "aadharCardImage": "base64_or_url"
  },
  "gstNumber": "29ABCDE1234F1Z5",
  "gstCertificate": "base64_or_url",
  "panNumber": "ABCDE1234F",
  "panCardImage": "base64_or_url",
  "tradeLicense": {
    "licenseNumber": "TL/2020/12345",
    "licenseImage": "base64_or_url",
    "issueDate": "2020-01-15",
    "expiryDate": "2030-01-15"
  },
  "fssaiLicense": {  // Optional
    "licenseNumber": "12345678901234",
    "licenseImage": "base64_or_url",
    "expiryDate": "2030-01-15"
  },
  "drugLicense": {  // Optional
    "licenseNumber": "DL/KA/2020/12345",
    "licenseImage": "base64_or_url",
    "expiryDate": "2030-01-15"
  },
  "certifications": [  // Optional
    {
      "name": "ISO 9001:2015",
      "certificateNumber": "ISO/2020/12345",
      "certificateImage": "base64_or_url",
      "issueDate": "2020-01-15",
      "expiryDate": "2025-01-15"
    }
  ],
  "companyLogo": "base64_or_url",
  "factoryImages": ["base64_or_url"],  // Optional
  "address": {
    "buildingName": "Himalaya House",
    "street": "Tumkur Road",
    "area": "Yeshwanthpur",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560022"
  },
  "bankDetails": {  // Optional
    "accountHolderName": "Himalaya Wellness Company",
    "accountNumber": "1234567890",
    "ifscCode": "HDFC0001234",
    "bankName": "HDFC Bank",
    "branchName": "Yeshwanthpur"
  },
  "productionCapacity": {  // Optional
    "value": 1000,
    "unit": "tons/month"
  },
  "employeeCount": 500  // Optional
}
```

### 👤 Consumer Registration
```json
{
  "role": "consumer",
  "phone": "9876543214",
  "name": "Priya Sharma",  // Optional
  "email": "priya@example.com",  // Optional
  "profileImage": "base64_or_url"  // Optional
}
```

---

## 🔒 Authentication Headers

After successful login, include the access token in subsequent requests:

```
Authorization: Bearer <accessToken>
```

---

## ⏱️ OTP Details

- **OTP Length:** 6 digits
- **OTP Validity:** 10 minutes
- **OTP Delivery:** SMS via Twilio
- **Resend Limit:** No limit (but rate-limited by Twilio)

---

## 📊 User Status Flow

### Farmer/Supplier/Industry:
1. **Registration** → Status: `pending`, isVerified: `false`, isApproved: `false`
2. **OTP Verification** → Status: `pending`, isVerified: `true`, isApproved: `false`
3. **Admin Approval** → Status: `active`, isVerified: `true`, isApproved: `true`

### Consumer:
1. **Registration** → Status: `active`, isVerified: `false`
2. **OTP Verification** → Status: `active`, isVerified: `true`

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid input or validation error |
| 401 | Unauthorized - Invalid token |
| 403 | Forbidden - Account blocked or not verified |
| 404 | Not Found - User not found |
| 409 | Conflict - User already exists |
| 500 | Internal Server Error |

---

## 💡 Testing Tips

1. **Use Postman or Thunder Client** for API testing
2. **Save tokens** after login for authenticated requests
3. **Test OTP flow** with real Twilio credentials
4. **Check MongoDB** to verify user creation
5. **Test all roles** separately to ensure proper validation

---

## 🔧 Environment Variables Required

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain
```

---

## 📞 Support

For issues or questions, contact the development team.
