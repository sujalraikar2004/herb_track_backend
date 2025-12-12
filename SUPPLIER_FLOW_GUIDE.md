# 🚚 Supplier Flow - Complete Guide

## 📋 Overview

**What you'll do:**
1. Register Supplier
2. Login Supplier
3. Scan Farmer's Batch QR
4. Create Payment Order
5. Complete Payment
6. Verify Ownership Transfer

---

## 🔥 STEP 4: Register Supplier

### **Endpoint:**
```
POST http://localhost:8000/api/v1/auth/register
```

### **Request Body:**
```json
{
  "role": "supplier",
  "phone": "9876543210",
  "name": "Ramesh Transport Services",
  "dateOfBirth": "1985-05-15",
  "profileImage": "https://res.cloudinary.com/demo/supplier-profile.jpg",
  "aadharNumber": "234567890123",
  "aadharCardImage": "https://res.cloudinary.com/demo/aadhar.jpg",
  "drivingLicense": {
    "licenseNumber": "KA0520230001234",
    "licenseImage": "https://res.cloudinary.com/demo/license.jpg",
    "expiryDate": "2028-12-31"
  },
  "vehicles": [
    {
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "truck",
      "rcBookImage": "https://res.cloudinary.com/demo/rc-book.jpg"
    }
  ],
  "address": {
    "street": "MG Road, Shantinagar",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560027"
  },
  "businessName": "Ramesh Logistics Pvt Ltd",
  "gstNumber": "29ABCDE1234F1Z5",
  "languagePreference": "kn"
}
```

### **Important Notes:**

**Required Fields:**
- ✅ `name` - 2-100 characters
- ✅ `phone` - 10 digits starting with 6-9
- ✅ `dateOfBirth` - Date in YYYY-MM-DD format
- ✅ `profileImage` - URL to profile image
- ✅ `aadharNumber` - Exactly 12 digits, **MUST BE UNIQUE**
- ✅ `aadharCardImage` - URL to Aadhar image
- ✅ `drivingLicense.licenseNumber` - **MUST BE UNIQUE**
- ✅ `drivingLicense.licenseImage` - URL
- ✅ `drivingLicense.expiryDate` - Future date
- ✅ `vehicles` - Array with at least 1 vehicle
  - `vehicleNumber` - Uppercase (e.g., KA01AB1234)
  - `vehicleType` - One of: bike, auto, van, truck, tempo
  - `rcBookImage` - URL to RC book image
- ✅ `address` - All fields required except street
  - `city`, `district`, `state` - Required
  - `pincode` - 6 digits, cannot start with 0

**Optional Fields:**
- `businessName` - Business name if registered
- `gstNumber` - Must match GST format if provided
- `languagePreference` - en, hi, kn, mr, ta, te (default: en)

### **Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your phone.",
  "data": {
    "userId": "675a2b3c4d5e6f7g8h9i0j1",
    "phone": "6364638991",
    "role": "supplier"
  }
}
```

### **Action:**
1. Send the request
2. **Check terminal** for OTP
3. **Copy the `userId`** - save as `{{supplierId}}`

---

## 📱 STEP 5: Verify Supplier OTP

### **Endpoint:**
```
POST http://localhost:8000/api/v1/auth/verify-registration
```

### **Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "YOUR_OTP_FROM_TERMINAL",
  "role": "supplier"
}
```

### **Terminal Output:**
```
✅ OTP sent successfully to +919876543210
🧪 TEST OTP: 123456 (Use this for verification)
```
**Use**: `123456` as your OTP

### **Expected Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "user": {
      "id": "675a2b3c4d5e6f7g8h9i0j1",
      "phone": "6364638991",
      "role": "supplier",
      "isVerified": true,
      "status": "active"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### **Action:**
1. Replace `YOUR_OTP_FROM_TERMINAL` with actual OTP
2. Send request
3. **Save `accessToken`** as `{{supplierToken}}`
4. **Save `user.id`** as `{{supplierId}}`

---

## 📦 STEP 6: Scan Farmer's Batch QR

**Purpose:** Supplier scans the QR code on the farmer's batch to see details

### **Endpoint:**
```
GET http://localhost:8000/api/v1/supply-chain/batches/scan/{{batchId}}?scannedBy={{supplierId}}&scannerType=Supplier
```

**Replace:**
- `{{batchId}}` - The batch ID you got from farmer's batch creation (Step 3)
- `{{supplierId}}` - Supplier's user ID

### **Headers:**
```
Authorization: Bearer {{supplierToken}}
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "batch": {
      "_id": "675a1234...",
      "batchId": "BATCH-MJ31RPO4-IU6L7",
      "herbName": "Ashwagandha",
      "quantity": {
        "value": 100,
        "unit": "kg"
      },
      "status": "harvested",
      "currentOwner": {
        "ownerId": "693c3693d84a15b209dfb733",
        "ownerType": "Farmer"
      },
      "farmerPrice": {
        "amount": 5000,
        "currency": "INR"
      },
      "gpsCoordinates": {
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "qualityMetrics": {
        "grade": "A+",
        "purity": 98,
        "organicCertified": true
      },
      "qrCodeURL": "...",
      "currentOwnerDetails": {
        "name": "Farmer Name",
        "phone": "6364638991"
      }
    },
    "chainHistory": [
      {
        "eventType": "BatchCreated",
        "performedBy": {
          "userName": "Farmer Name",
          "userType": "Farmer"
        },
        "timestamp": "2025-12-12T..."
      }
    ]
  }
}
```

### **Action:**
1. Review batch details - quality, quantity, price
2. Note the `farmerPrice.amount` (this is what supplier pays)
3. Decide to purchase!

---

## 💳 STEP 7: Create Payment Order (Supplier → Farmer)

**Purpose:** Supplier initiates payment to buy the batch from farmer

### **Endpoint:**
```
POST http://localhost:8000/api/v1/payments/create-order
```

### **Headers:**
```
Authorization: Bearer {{supplierToken}}
Content-Type: application/json
```

### **Request Body:**
```json
{
  "batchId": "{{batchId}}",
  "payerId": "{{supplierId}}",
  "payerType": "Supplier",
  "amount": 5000,
  "paymentMode": "Cash"
}
```

**Note:** Using "Cash" for easier testing. Can use "Razorpay" for online payment.

### **Expected Response:**
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "payment": {
      "_id": "675a...",
      "paymentId": "PAY-ABC123",
      "batchId": "675a1234...",
      "payer": {
        "userId": "675a2b3c...",
        "userType": "Supplier",
        "name": "Ramesh Transport Services",
        "phone": "6364638991"
      },
      "payee": {
        "userId": "693c3693...",
        "userType": "Farmer",
        "name": "Farmer Name",
        "phone": "6364638991"
      },
      "amount": 5000,
      "paymentMode": "Cash",
      "status": "pending"
    }
  }
}
```

### **Action:**
1. **Save `payment.paymentId`** as `{{paymentId}}`
2. This creates a pending payment record
3. Now complete the payment in next step

---

## ✅ STEP 8: Complete Cash Payment

**Purpose:** Mark the cash payment as completed

### **Endpoint:**
```
POST http://localhost:8000/api/v1/payments/cash-payment
```

### **Headers:**
```
Authorization: Bearer {{supplierToken}}
Content-Type: application/json
```

### **Request Body:**
```json
{
  "paymentId": "{{paymentId}}",
  "receivedBy": "Farmer Name",
  "receiptNumber": "RCPT-SUP-001",
  "witnessName": "Mohan Kumar",
  "witnessPhone": "9876543210"
}
```

### **Expected Response:**
```json
{
  "success": true,
  "message": "Cash payment completed and ownership transferred",
  "data": {
    "payment": {
      "paymentId": "PAY-ABC123",
      "status": "completed",
      "completedAt": "2025-12-12T...",
      "cash": {
        "receivedBy": "Farmer Name",
        "receiptNumber": "RCPT-SUP-001",
        "witnessName": "Mohan Kumar"
      }
    },
    "batch": {
      "batchId": "BATCH-MJ31RPO4-IU6L7",
      "currentOwner": {
        "ownerId": "675a2b3c...",
        "ownerType": "Supplier",
        "acquiredAt": "2025-12-12T..."
      },
      "status": "with_supplier"
    },
    "chainEvent": {
      "eventType": "SupplierPurchase",
      "performedBy": {
        "userName": "Ramesh Transport Services",
        "userType": "Supplier"
      },
      "transaction": {
        "amount": 5000,
        "paymentMode": "Cash",
        "paymentStatus": "completed"
      }
    }
  }
}
```

### **What Happened:**
✅ Payment marked as completed
✅ **Batch ownership transferred from Farmer to Supplier**
✅ Batch status changed to "with_supplier"
✅ Chain event created: "SupplierPurchase"
✅ Complete transaction recorded

---

## 🔍 STEP 9: Verify Ownership Transfer

**Purpose:** Confirm that supplier now owns the batch

### **Endpoint:**
```
GET http://localhost:8000/api/v1/supply-chain/batches/scan/{{batchId}}?scannedBy={{supplierId}}&scannerType=Supplier
```

### **Headers:**
```
Authorization: Bearer {{supplierToken}}
```

### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "batch": {
      "currentOwner": {
        "ownerId": "675a2b3c...",
        "ownerType": "Supplier"  ← NOW SUPPLIER OWNS IT!
      },
      "status": "with_supplier"  ← STATUS UPDATED!
    },
    "chainHistory": [
      {
        "eventType": "BatchCreated",
        "performedBy": { "userType": "Farmer" }
      },
      {
        "eventType": "SupplierPurchase",  ← NEW EVENT!
        "performedBy": { "userType": "Supplier" },
        "transaction": {
          "amount": 5000,
          "paymentStatus": "completed"
        }
      }
    ],
    "totalEvents": 2  ← NOW 2 EVENTS IN CHAIN!
  }
}
```

---

## ✅ Supplier Flow Complete!

### **Summary of What Happened:**

1. ✅ **Registered Supplier** with transport details
2. ✅ **Logged in Supplier** with OTP
3. ✅ **Scanned Farmer's Batch QR** to see product details
4. ✅ **Created Payment Order** for ₹5,000
5. ✅ **Completed Cash Payment** with witness
6. ✅ **Ownership Transferred** from Farmer to Supplier
7. ✅ **Chain Event Created** in blockchain-like record

### **Current State:**

```
Farmer (Created) → Supplier (Owns Now) → Industry (Next!)
     ↓                    ↓
  Harvested         With Supplier
```

---

## 🎯 Next: Industry Flow

The supplier now owns the batch. Next steps:
1. Register Industry
2. Industry scans supplier's batch
3. Industry purchases from supplier
4. Industry creates final product
5. Consumer sees complete journey!

---

## 📊 Database State Check

You can verify in MongoDB:

```javascript
// Batch
currentOwner: {
  ownerId: "675a2b3c..." (Supplier ID),
  ownerType: "Supplier"
}
status: "with_supplier"

// Chain Events
1. BatchCreated (by Farmer)
2. SupplierPurchase (Farmer → Supplier)

// Payment
status: "completed"
payer: Supplier
payee: Farmer
amount: 5000
```

---

## 💡 Testing Tips

1. **Save all IDs** from responses (userId, batchId, paymentId)
2. **Check terminal** for OTPs after each registration
3. **Use Postman environment variables** to store tokens and IDs
4. **Verify chain history** grows with each transfer

---

**Ready for Industry flow?** Let me know and I'll guide you through creating the final product! 🏭

