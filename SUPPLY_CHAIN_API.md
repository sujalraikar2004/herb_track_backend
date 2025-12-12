# 🌿 Complete Supply Chain API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

---

## 📋 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Supply Chain - Batch Management](#supply-chain---batch-management)
3. [Payment APIs](#payment-apis)
4. [Final Product APIs](#final-product-apis)
5. [Complete Workflow](#complete-workflow)

---

## 🔐 Authentication APIs

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete authentication documentation.

**Quick Reference:**
- `POST /auth/register` - Register user
- `POST /auth/verify-registration` - Verify OTP
- `POST /auth/login` - Request login OTP
- `POST /auth/verify-login` - Verify login OTP
- `POST /auth/resend-otp` - Resend OTP

---

## 🌾 Supply Chain - Batch Management

### 1. Create Batch (Farmer)
**Endpoint:** `POST /supply-chain/batches/create`

**Description:** Farmer creates a new product batch and gets QR code automatically generated.

**Request Body:**
```json
{
  "farmerId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "herbName": "Ashwagandha",
  "scientificName": "Withania somnifera",
  "category": "root",
  "harvestDate": "2025-12-10",
  "quantity": {
    "value": 100,
    "unit": "kg"
  },
  "gpsCoordinates": {
    "latitude": 12.9716,
    "longitude": 77.5946,
    "accuracy": 10
  },
  "location": {
    "village": "Kothapalli",
    "taluk": "Somwarpet",
    "district": "Kodagu",
    "state": "Karnataka"
  },
  "qualityMetrics": {
    "moisture": 10.5,
    "purity": 98,
    "color": "Brown",
    "aroma": "Strong",
    "grade": "A+",
    "organicCertified": true
  },
  "images": [
    {
      "url": "https://cloudinary.com/image1.jpg",
      "caption": "Harvested roots"
    }
  ],
  "description": "Fresh organic Ashwagandha roots",
  "farmerPrice": {
    "amount": 5000,
    "currency": "INR"
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batch": {
      "_id": "...",
      "batchId": "BATCH-ABC123",
      "farmerId": "...",
      "herbName": "Ashwagandha",
      "qrCodeURL": "https://yourapp.com/scan/batch/...",
      "qrCodeData": "data:image/png;base64,...",
      "status": "harvested",
      "currentOwner": {
        "ownerId": "...",
        "ownerType": "Farmer"
      }
    },
    "qrCodeURL": "https://yourapp.com/scan/batch/...",
    "qrCodeData": "data:image/png;base64,..."
  }
}
```

---

### 2. Scan Batch QR Code
**Endpoint:** `GET /supply-chain/batches/scan/:batchId`

**Description:** Anyone can scan the QR code to see complete batch details and chain history.

**Query Parameters:**
- `scannedBy` (optional) - User ID who scanned
- `scannerType` (optional) - Consumer/Supplier/Industry

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "batch": {
      "batchId": "BATCH-ABC123",
      "herbName": "Ashwagandha",
      "harvestDate": "2025-12-10",
      "quantity": { "value": 100, "unit": "kg" },
      "gpsCoordinates": { "latitude": 12.9716, "longitude": 77.5946 },
      "location": { "village": "Kothapalli", "district": "Kodagu", "state": "Karnataka" },
      "qualityMetrics": { "grade": "A+", "purity": 98 },
      "farmerPrice": { "amount": 5000 },
      "status": "with_supplier",
      "currentOwnerDetails": {
        "name": "Suresh Patil",
        "phone": "9876543211",
        "role": "Supplier"
      }
    },
    "chainHistory": [
      {
        "eventType": "BatchCreated",
        "performedBy": {
          "userName": "Ramesh Kumar",
          "userType": "Farmer"
        },
        "timestamp": "2025-12-10T10:00:00Z",
        "performerDetails": {
          "name": "Ramesh Kumar",
          "phone": "9876543210",
          "profileImage": "..."
        }
      },
      {
        "eventType": "SupplierPurchase",
        "performedBy": {
          "userName": "Suresh Patil",
          "userType": "Supplier"
        },
        "transaction": {
          "amount": 5000,
          "paymentMode": "UPI",
          "paymentStatus": "completed"
        },
        "timestamp": "2025-12-10T14:00:00Z"
      }
    ],
    "totalEvents": 2
  }
}
```

---

### 3. Get Farmer's Batches
**Endpoint:** `GET /supply-chain/batches/farmer/:farmerId`

**Query Parameters:**
- `status` (optional) - Filter by status
- `page` (default: 1)
- `limit` (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "batches": [...],
    "totalPages": 5,
    "currentPage": 1,
    "total": 45
  }
}
```

---

### 4. Search Batches
**Endpoint:** `GET /supply-chain/batches/search`

**Query Parameters:**
- `herbName` - Search by herb name
- `district` - Filter by district
- `state` - Filter by state
- `status` - Filter by status
- `page`, `limit` - Pagination

---

## 💰 Payment APIs

### 1. Create Payment Order
**Endpoint:** `POST /payments/create-order`

**Description:** Supplier/Industry creates payment order to purchase batch.

**Request Body:**
```json
{
  "batchId": "64f5a1b2c3d4e5f6g7h8i9j0",
  "payerId": "supplier_or_industry_id",
  "payerType": "Supplier",
  "amount": 5000,
  "paymentMode": "Razorpay"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "payment": {
      "paymentId": "PAY-XYZ789",
      "batchId": "...",
      "payer": { "name": "Suresh Patil", "userType": "Supplier" },
      "payee": { "name": "Ramesh Kumar", "userType": "Farmer" },
      "amount": 5000,
      "paymentMode": "Razorpay",
      "status": "pending"
    },
    "razorpayOrder": {
      "id": "order_razorpay_id",
      "amount": 500000,
      "currency": "INR"
    }
  }
}
```

---

### 2. Verify Razorpay Payment
**Endpoint:** `POST /payments/verify`

**Description:** Verify Razorpay payment signature and transfer ownership.

**Request Body:**
```json
{
  "paymentId": "PAY-XYZ789",
  "razorpayOrderId": "order_razorpay_id",
  "razorpayPaymentId": "pay_razorpay_id",
  "razorpaySignature": "signature_hash"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and ownership transferred",
  "data": {
    "payment": {
      "status": "completed",
      "completedAt": "2025-12-10T14:30:00Z"
    },
    "batch": {
      "currentOwner": {
        "ownerId": "supplier_id",
        "ownerType": "Supplier"
      },
      "status": "with_supplier"
    },
    "chainEvent": {
      "eventType": "SupplierPurchase",
      "transaction": {
        "amount": 5000,
        "paymentMode": "Razorpay"
      }
    }
  }
}
```

---

### 3. Complete Cash Payment
**Endpoint:** `POST /payments/cash-payment`

**Description:** Complete cash payment without Razorpay.

**Request Body:**
```json
{
  "paymentId": "PAY-XYZ789",
  "receivedBy": "Ramesh Kumar",
  "receiptNumber": "RCPT-001",
  "witnessName": "Witness Name",
  "witnessPhone": "9876543212",
  "proofImages": ["https://cloudinary.com/receipt.jpg"]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cash payment completed and ownership transferred",
  "data": {
    "payment": { "status": "completed" },
    "batch": { "status": "with_supplier" },
    "chainEvent": { "eventType": "SupplierPurchase" }
  }
}
```

---

### 4. Get User Payments
**Endpoint:** `GET /payments/user/:userId`

**Query Parameters:**
- `type` - all/sent/received
- `page`, `limit` - Pagination

---

## 🏭 Final Product APIs

### 1. Create Final Product
**Endpoint:** `POST /final-products/create`

**Description:** Industry creates final product from purchased batches.

**Request Body:**
```json
{
  "industryId": "industry_id",
  "sourceBatches": ["batch_id_1", "batch_id_2"],
  "productName": "Ashwagandha Capsules",
  "brandName": "Himalaya",
  "productType": "capsule",
  "category": "ayurvedic",
  "ingredients": [
    {
      "batchId": "batch_id_1",
      "herbName": "Ashwagandha",
      "quantity": { "value": 500, "unit": "mg" },
      "percentage": 100
    }
  ],
  "formulationDetails": "Pure Ashwagandha root extract",
  "packaging": {
    "type": "bottle",
    "material": "HDPE",
    "quantity": { "value": 60, "unit": "capsules" },
    "batchSize": 1000
  },
  "manufacturingDate": "2025-12-11",
  "expiryDate": "2027-12-11",
  "labTests": [
    {
      "testName": "Heavy Metal Test",
      "labName": "SGS Labs",
      "testDate": "2025-12-10",
      "result": "Pass",
      "status": "pass",
      "certificateUrl": "https://..."
    }
  ],
  "certifications": [
    {
      "name": "GMP Certified",
      "certificateNumber": "GMP-2025-001",
      "issuedBy": "WHO",
      "issuedDate": "2025-01-01",
      "certificateUrl": "https://..."
    }
  ],
  "fssaiLicense": "12345678901234",
  "mrp": { "amount": 499, "currency": "INR" },
  "productImages": [
    { "url": "https://...", "type": "front" }
  ],
  "dosage": "1-2 capsules daily",
  "usageInstructions": "Take with warm water after meals",
  "warnings": ["Consult doctor if pregnant"],
  "benefits": ["Reduces stress", "Improves immunity"],
  "barcode": "8901234567890",
  "sku": "HIM-ASH-60"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Final product created successfully",
  "data": {
    "finalProduct": {
      "productId": "PROD-ABC123",
      "productName": "Ashwagandha Capsules",
      "qrCodeURL": "https://yourapp.com/scan/product/...",
      "qrCodeData": "data:image/png;base64,...",
      "status": "in_production"
    },
    "qrCodeURL": "...",
    "qrCodeData": "..."
  }
}
```

---

### 2. Scan Final Product QR
**Endpoint:** `GET /final-products/scan/:productId`

**Description:** Consumer scans final product QR to see complete journey.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "productId": "PROD-ABC123",
      "productName": "Ashwagandha Capsules",
      "brandName": "Himalaya",
      "manufacturingDate": "2025-12-11",
      "expiryDate": "2027-12-11",
      "mrp": { "amount": 499 }
    },
    "journey": {
      "farmers": [
        {
          "name": "Ramesh Kumar",
          "phone": "9876543210",
          "address": { "village": "Kothapalli", "district": "Kodagu" },
          "batchDetails": {
            "batchId": "BATCH-ABC123",
            "herbName": "Ashwagandha",
            "harvestDate": "2025-12-10",
            "quantity": { "value": 100, "unit": "kg" },
            "gpsCoordinates": { "latitude": 12.9716, "longitude": 77.5946 }
          }
        }
      ],
      "suppliers": [
        {
          "name": "Suresh Patil",
          "phone": "9876543211",
          "timestamp": "2025-12-10T14:00:00Z",
          "transaction": { "amount": 5000, "paymentMode": "UPI" }
        }
      ],
      "industry": {
        "name": "Himalaya Wellness Company",
        "phone": "9876543212",
        "email": "contact@himalaya.com",
        "address": { "city": "Bangalore", "state": "Karnataka" }
      },
      "finalProduct": {
        "productName": "Ashwagandha Capsules",
        "certifications": [...],
        "labTests": [...],
        "ingredients": [...],
        "benefits": [...]
      }
    },
    "totalScans": 156
  }
}
```

---

## 🔄 Complete Workflow

### Workflow 1: Farmer → Supplier → Industry → Consumer

#### Step 1: Farmer Creates Batch
```bash
POST /supply-chain/batches/create
# Farmer fills herb details
# QR code auto-generated
# Status: "harvested"
```

#### Step 2: Supplier Scans QR
```bash
GET /supply-chain/batches/scan/:batchId
# Supplier sees all farmer details
# Verifies quality, location, etc.
```

#### Step 3: Supplier Makes Payment
```bash
# Option A: Razorpay
POST /payments/create-order
POST /payments/verify

# Option B: Cash
POST /payments/create-order
POST /payments/cash-payment

# Result:
# - Payment recorded
# - Ownership transferred to Supplier
# - Chain event created
# - Batch status: "with_supplier"
```

#### Step 4: Industry Scans Same QR
```bash
GET /supply-chain/batches/scan/:batchId
# Industry sees:
# - Farmer details
# - Supplier details
# - Complete chain history
```

#### Step 5: Industry Makes Payment
```bash
POST /payments/create-order
POST /payments/verify

# Result:
# - Ownership transferred to Industry
# - Chain event created
# - Batch status: "with_industry"
```

#### Step 6: Industry Creates Final Product
```bash
POST /final-products/create
# Industry combines batches
# Creates finished product
# New QR code generated for final product
# Source batches status: "processed"
```

#### Step 7: Consumer Scans Final Product QR
```bash
GET /final-products/scan/:productId
# Consumer sees COMPLETE journey:
# - Farmer → Supplier → Industry → Product
# - All locations, dates, payments
# - Lab tests, certifications
# - Complete transparency
```

---

## 📊 Data Models Summary

### ProductBatch
- Created by Farmer
- Has QR code
- Tracks current owner
- Contains chain events
- Links to final product

### ChainEvent
- Records every transaction
- Stores performer details
- Contains payment info
- Tracks location
- Immutable audit trail

### Payment
- Supports Razorpay & Cash
- Links payer & payee
- Verifies transactions
- Stores receipts
- Updates ownership

### FinalProduct
- Created by Industry
- Links to source batches
- Has new QR code
- Contains complete traceability
- Tracks consumer scans

---

## 🔒 Security Features

- ✅ OTP-based authentication
- ✅ JWT tokens
- ✅ Razorpay signature verification
- ✅ Ownership validation
- ✅ Approval workflow
- ✅ Immutable chain events
- ✅ GPS verification
- ✅ Document verification

---

## 📱 Mobile App Integration

All endpoints return JSON and are mobile-friendly. Use the QR codes in the app to scan and display complete traceability.

---

## 🎯 Next Steps

1. Test all endpoints with Postman
2. Integrate with Android app
3. Add image upload with Cloudinary
4. Implement authentication middleware
5. Add rate limiting
6. Set up production database
7. Deploy to cloud

---

**Built with ❤️ for complete herbal supply chain transparency**
