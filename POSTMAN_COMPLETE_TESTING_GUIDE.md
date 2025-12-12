# 🧪 Complete Postman Testing Guide - Herbal Supply Chain

This guide walks you through testing the **COMPLETE** supply chain flow from farmer registration to consumer scanning the final product.

## 📋 Table of Contents
1. [Setup](#setup)
2. [Complete Flow Overview](#complete-flow-overview)
3. [Step-by-Step Testing](#step-by-step-testing)
4. [Troubleshooting](#troubleshooting)

---

## 🛠️ Setup

### 1. Import Postman Collection
1. Open Postman
2. Click **Import** button
3. Select `Herbal_Supply_Chain.postman_collection.json` from the backend folder
4. Collection will be imported with all endpoints

### 2. Set Environment Variables
Create a new environment in Postman with these variables:

```
base_url = http://localhost:8000/api/v1
test_phone = 9999999999

# These will be filled as you test:
farmerId = 
farmerToken = 
supplierId = 
supplierToken = 
industryId = 
industryToken = 
consumerId = 
consumerToken = 
batchId = 
paymentId = 
productId = 
```

### 3. Verify Server is Running
Make sure your backend server is running:
```bash
cd /home/sujal/Desktop/sih/backend
npm run dev
```

You should see: `✅ Server running on port 8000`

---

## 🔄 Complete Flow Overview

```
1. FARMER REGISTRATION & LOGIN
   ↓
2. FARMER CREATES BATCH (with QR code)
   ↓
3. SUPPLIER REGISTRATION & LOGIN
   ↓
4. SUPPLIER SCANS BATCH QR
   ↓
5. SUPPLIER PURCHASES BATCH (Payment)
   ↓
6. INDUSTRY REGISTRATION & LOGIN
   ↓
7. INDUSTRY SCANS BATCH QR
   ↓
8. INDUSTRY PURCHASES BATCH (Payment)
   ↓
9. INDUSTRY CREATES FINAL PRODUCT (with new QR)
   ↓
10. CONSUMER REGISTRATION & LOGIN
   ↓
11. CONSUMER SCANS FINAL PRODUCT QR
   ↓
12. COMPLETE TRACEABILITY SHOWN
```

---

## 📝 Step-by-Step Testing

## PHASE 1: FARMER FLOW

### Step 1: Register Farmer

**Endpoint:** `POST {{base_url}}/auth/register`

**Body (raw JSON):**
```json
{
  "role": "farmer",
  "name": "Ramesh Kumar",
  "phone": "9999999999",
  "dateOfBirth": "1985-05-15",
  "aadharNumber": "123456789001",
  "address": {
    "village": "Kothapalli",
    "taluk": "Somwarpet",
    "district": "Kodagu",
    "state": "Karnataka",
    "pincode": "571236"
  },
  "farmSize": 5.5,
  "cropsGrown": ["Ashwagandha", "Tulsi", "Neem"]
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. OTP sent to your phone number.",
  "data": {
    "userId": "...",
    "phone": "9999999999",
    "role": "farmer"
  }
}
```

**Action:** 
- ✅ Copy `userId` and save it as `farmerId` in environment variables
- ✅ Check your terminal/console for OTP (in test mode)
- You'll see: `🧪 TEST OTP: 123456`

---

### Step 2: Verify Farmer Registration

**Endpoint:** `POST {{base_url}}/auth/verify-registration`

**Body:**
```json
{
  "phone": "9999999999",
  "otp": "123456",
  "role": "farmer"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "user": {
      "id": "...",
      "role": "farmer",
      "isVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Action:**
- ✅ Copy `accessToken` and save as `farmerToken` in environment

---

### Step 3: Farmer Login (Optional - for future sessions)

**Endpoint:** `POST {{base_url}}/auth/login`

**Body:**
```json
{
  "phone": "9999999999"
}
```

Then verify with OTP from console.

---

### Step 4: Farmer Creates Batch

**Endpoint:** `POST {{base_url}}/supply-chain/batches/create`

**Headers:**
```
Authorization: Bearer {{farmerToken}}
```

**Body:**
```json
{
  "farmerId": "{{farmerId}}",
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
  "description": "Fresh organic Ashwagandha roots",
  "farmerPrice": {
    "amount": 5000,
    "currency": "INR"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Batch created successfully",
  "data": {
    "batch": {
      "_id": "...",
      "batchId": "BATCH-ABC123",
      "qrCodeURL": "https://yourapp.com/scan/batch/...",
      "qrCodeData": "data:image/png;base64,...",
      "status": "harvested"
    }
  }
}
```

**Action:**
- ✅ Copy `_id` and save as `batchId` in environment
- ✅ The QR code is auto-generated!
- ✅ Note the `batchId` (e.g., BATCH-ABC123)

---

## PHASE 2: SUPPLIER FLOW

### Step 5: Register Supplier

**Endpoint:** `POST {{base_url}}/auth/register`

**Body:**
```json
{
  "role": "supplier",
  "name": "Suresh Patil",
  "phone": "9999999999",
  "dateOfBirth": "1990-08-20",
  "aadharNumber": "123456789002",
  "drivingLicense": {
    "licenseNumber": "KA0120210012345",
    "expiryDate": "2030-08-20"
  },
  "vehicles": [
    {
      "vehicleNumber": "KA01AB1234",
      "vehicleType": "truck"
    }
  ],
  "address": {
    "street": "MG Road",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "businessName": "Patil Transport Services"
}
```

**Action:**
- ✅ Save `userId` as `supplierId`
- ✅ Get OTP from console

---

### Step 6: Verify Supplier Registration

**Endpoint:** `POST {{base_url}}/auth/verify-registration`

**Body:**
```json
{
  "phone": "9999999999",
  "otp": "123456",
  "role": "supplier"
}
```

**Action:**
- ✅ Save `accessToken` as `supplierToken`

---

### Step 7: Supplier Scans Batch QR

**Endpoint:** `GET {{base_url}}/supply-chain/batches/scan/{{batchId}}`

**Query Params:**
```
scannedBy = {{supplierId}}
scannerType = Supplier
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "batch": {
      "batchId": "BATCH-ABC123",
      "herbName": "Ashwagandha",
      "farmerPrice": { "amount": 5000 },
      "status": "harvested",
      "currentOwnerDetails": {
        "name": "Ramesh Kumar",
        "role": "Farmer"
      }
    },
    "chainHistory": [
      {
        "eventType": "BatchCreated",
        "performedBy": {
          "userName": "Ramesh Kumar",
          "userType": "Farmer"
        }
      }
    ]
  }
}
```

**Action:**
- ✅ Supplier can see complete farmer details
- ✅ Verify quality, location, price

---

### Step 8: Supplier Creates Payment Order

**Endpoint:** `POST {{base_url}}/payments/create-order`

**Headers:**
```
Authorization: Bearer {{supplierToken}}
```

**Body:**
```json
{
  "batchId": "{{batchId}}",
  "payerId": "{{supplierId}}",
  "payerType": "Supplier",
  "amount": 5000,
  "paymentMode": "Razorpay"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "payment": {
      "paymentId": "PAY-XYZ789",
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

**Action:**
- ✅ Save `paymentId` as `paymentId` in environment
- ✅ In real app, Razorpay payment gateway would open here

---

### Step 9: Complete Payment (Choose Option A or B)

#### Option A: Verify Razorpay Payment

**Endpoint:** `POST {{base_url}}/payments/verify`

**Body:**
```json
{
  "paymentId": "{{paymentId}}",
  "razorpayOrderId": "order_test_123",
  "razorpayPaymentId": "pay_test_456",
  "razorpaySignature": "test_signature_hash"
}
```

#### Option B: Complete Cash Payment

**Endpoint:** `POST {{base_url}}/payments/cash-payment`

**Body:**
```json
{
  "paymentId": "{{paymentId}}",
  "receivedBy": "Ramesh Kumar",
  "receiptNumber": "RCPT-001",
  "witnessName": "Witness Name",
  "witnessPhone": "9876543212"
}
```

**Expected Response (Both Options):**
```json
{
  "success": true,
  "message": "Payment verified and ownership transferred",
  "data": {
    "payment": {
      "status": "completed"
    },
    "batch": {
      "currentOwner": {
        "ownerId": "{{supplierId}}",
        "ownerType": "Supplier"
      },
      "status": "with_supplier"
    },
    "chainEvent": {
      "eventType": "SupplierPurchase"
    }
  }
}
```

**Action:**
- ✅ Ownership transferred from Farmer → Supplier
- ✅ Chain event recorded
- ✅ Batch status updated

---

## PHASE 3: INDUSTRY FLOW

### Step 10: Register Industry

**Endpoint:** `POST {{base_url}}/auth/register`

**Body:**
```json
{
  "role": "industry",
  "industryName": "Himalaya Wellness Company",
  "industryType": "ayurvedic",
  "yearEstablished": 1930,
  "phone": "9999999999",
  "email": "contact@himalaya.test",
  "website": "https://himalayawellness.com",
  "authorizedPerson": {
    "name": "Dr. Mehra",
    "designation": "Managing Director",
    "phone": "9876543213",
    "email": "mehra@himalaya.test",
    "aadharNumber": "123456789003"
  },
  "gstNumber": "29ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "tradeLicense": {
    "licenseNumber": "TL/2020/12345",
    "issueDate": "2020-01-15",
    "expiryDate": "2030-01-15"
  },
  "fssaiLicense": {
    "licenseNumber": "12345678901234",
    "expiryDate": "2030-01-15"
  },
  "address": {
    "buildingName": "Himalaya House",
    "street": "Tumkur Road",
    "city": "Bangalore",
    "district": "Bangalore Urban",
    "state": "Karnataka",
    "pincode": "560022"
  }
}
```

**Action:**
- ✅ Save `userId` as `industryId`
- ✅ Get OTP from console

---

### Step 11: Verify Industry Registration

**Endpoint:** `POST {{base_url}}/auth/verify-registration`

**Body:**
```json
{
  "phone": "9999999999",
  "otp": "123456",
  "role": "industry"
}
```

**Action:**
- ✅ Save `accessToken` as `industryToken`

---

### Step 12: Industry Scans Batch QR

**Endpoint:** `GET {{base_url}}/supply-chain/batches/scan/{{batchId}}`

**Query Params:**
```
scannedBy = {{industryId}}
scannerType = Industry
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "batch": {
      "status": "with_supplier",
      "currentOwnerDetails": {
        "name": "Suresh Patil",
        "role": "Supplier"
      }
    },
    "chainHistory": [
      {
        "eventType": "BatchCreated",
        "performedBy": { "userName": "Ramesh Kumar" }
      },
      {
        "eventType": "SupplierPurchase",
        "performedBy": { "userName": "Suresh Patil" },
        "transaction": { "amount": 5000 }
      }
    ]
  }
}
```

**Action:**
- ✅ Industry sees complete chain: Farmer → Supplier
- ✅ All transactions visible

---

### Step 13: Industry Purchases Batch

**Endpoint:** `POST {{base_url}}/payments/create-order`

**Headers:**
```
Authorization: Bearer {{industryToken}}
```

**Body:**
```json
{
  "batchId": "{{batchId}}",
  "payerId": "{{industryId}}",
  "payerType": "Industry",
  "amount": 7000,
  "paymentMode": "Razorpay"
}
```

Then complete payment (Razorpay or Cash) as in Step 9.

**Action:**
- ✅ Ownership transferred: Supplier → Industry
- ✅ Batch status: `with_industry`

---

### Step 14: Industry Creates Final Product

**Endpoint:** `POST {{base_url}}/final-products/create`

**Headers:**
```
Authorization: Bearer {{industryToken}}
```

**Body:**
```json
{
  "industryId": "{{industryId}}",
  "sourceBatches": ["{{batchId}}"],
  "productName": "Ashwagandha Capsules",
  "brandName": "Himalaya",
  "productType": "capsule",
  "category": "ayurvedic",
  "ingredients": [
    {
      "batchId": "{{batchId}}",
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
      "status": "pass"
    }
  ],
  "certifications": [
    {
      "name": "GMP Certified",
      "certificateNumber": "GMP-2025-001",
      "issuedBy": "WHO",
      "issuedDate": "2025-01-01"
    }
  ],
  "fssaiLicense": "12345678901234",
  "mrp": { "amount": 499, "currency": "INR" },
  "dosage": "1-2 capsules daily",
  "usageInstructions": "Take with warm water after meals",
  "warnings": ["Consult doctor if pregnant"],
  "benefits": ["Reduces stress", "Improves immunity"],
  "barcode": "8901234567890",
  "sku": "HIM-ASH-60"
}
```

**Expected Response:**
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
    }
  }
}
```

**Action:**
- ✅ Save `_id` as `productId` in environment
- ✅ NEW QR code generated for final product!
- ✅ Source batch status updated to `processed`

---

## PHASE 4: CONSUMER FLOW

### Step 15: Register Consumer

**Endpoint:** `POST {{base_url}}/auth/register`

**Body:**
```json
{
  "role": "consumer",
  "phone": "9999999999",
  "name": "Priya Sharma",
  "email": "priya@example.com"
}
```

**Action:**
- ✅ Save `userId` as `consumerId`

---

### Step 16: Verify Consumer Registration

**Endpoint:** `POST {{base_url}}/auth/verify-registration`

**Body:**
```json
{
  "phone": "9999999999",
  "otp": "123456",
  "role": "consumer"
}
```

**Action:**
- ✅ Save `accessToken` as `consumerToken`

---

### Step 17: Consumer Scans Final Product QR

**Endpoint:** `GET {{base_url}}/final-products/scan/{{productId}}`

**Query Params:**
```
scannedBy = {{consumerId}}
scannerType = Consumer
```

**Expected Response:**
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
          "phone": "9999999999",
          "address": {
            "village": "Kothapalli",
            "district": "Kodagu",
            "state": "Karnataka"
          },
          "batchDetails": {
            "batchId": "BATCH-ABC123",
            "herbName": "Ashwagandha",
            "harvestDate": "2025-12-10",
            "quantity": { "value": 100, "unit": "kg" },
            "gpsCoordinates": {
              "latitude": 12.9716,
              "longitude": 77.5946
            },
            "qualityMetrics": {
              "grade": "A+",
              "purity": 98,
              "organicCertified": true
            }
          }
        }
      ],
      "suppliers": [
        {
          "name": "Suresh Patil",
          "phone": "9999999999",
          "businessName": "Patil Transport Services",
          "timestamp": "2025-12-10T14:00:00Z",
          "transaction": {
            "amount": 5000,
            "paymentMode": "Razorpay"
          }
        }
      ],
      "industry": {
        "name": "Himalaya Wellness Company",
        "phone": "9999999999",
        "email": "contact@himalaya.test",
        "address": {
          "city": "Bangalore",
          "state": "Karnataka"
        },
        "purchaseTimestamp": "2025-12-11T10:00:00Z",
        "transaction": {
          "amount": 7000,
          "paymentMode": "Razorpay"
        }
      },
      "finalProduct": {
        "productName": "Ashwagandha Capsules",
        "certifications": [
          {
            "name": "GMP Certified",
            "issuedBy": "WHO"
          }
        ],
        "labTests": [
          {
            "testName": "Heavy Metal Test",
            "result": "Pass",
            "labName": "SGS Labs"
          }
        ],
        "ingredients": [
          {
            "herbName": "Ashwagandha",
            "quantity": { "value": 500, "unit": "mg" }
          }
        ],
        "benefits": [
          "Reduces stress",
          "Improves immunity"
        ]
      }
    },
    "totalScans": 1
  }
}
```

**🎉 SUCCESS!**
- ✅ Consumer sees **COMPLETE JOURNEY**
- ✅ Farmer details with GPS location
- ✅ Supplier details with transaction
- ✅ Industry details with certifications
- ✅ Lab tests and quality metrics
- ✅ Complete transparency!

---

## 🎯 Additional Tests

### Test 18: Get Farmer's Batches

**Endpoint:** `GET {{base_url}}/supply-chain/batches/farmer/{{farmerId}}`

Shows all batches created by the farmer.

---

### Test 19: Get User Payments

**Endpoint:** `GET {{base_url}}/payments/user/{{supplierId}}?type=all`

Shows all payments (sent/received) for a user.

---

### Test 20: Search Batches

**Endpoint:** `GET {{base_url}}/supply-chain/batches/search?herbName=Ashwagandha&state=Karnataka`

Search batches by various criteria.

---

### Test 21: Get Industry Products

**Endpoint:** `GET {{base_url}}/final-products/industry/{{industryId}}`

Shows all products created by the industry.

---

## 🐛 Troubleshooting

### Issue 1: "User already exists"
**Solution:** You're trying to register the same role twice with the same phone. Either:
- Use a different phone number
- Delete the user from MongoDB
- Use login instead of register

### Issue 2: "OTP not found in console"
**Solution:** 
- Check if `NODE_ENV=development` in `.env`
- Check if `TEST_MODE=true` in `.env`
- Look for `🧪 TEST OTP:` in terminal

### Issue 3: "Invalid OTP"
**Solution:**
- OTP expires in 10 minutes
- Use the exact OTP from console
- Request a new OTP with resend-otp endpoint

### Issue 4: "Batch not found"
**Solution:**
- Make sure you saved the correct `batchId` from Step 4
- Use the MongoDB `_id`, not the `batchId` field

### Issue 5: "Payment verification failed"
**Solution:**
- For testing, use cash payment option
- Razorpay requires valid signature (use test mode)

### Issue 6: "Cannot create final product"
**Solution:**
- Make sure batch is owned by industry
- Complete payment first (Step 13)
- Verify batch status is `with_industry`

---

## 📊 Testing Checklist

- [ ] Farmer registered and verified
- [ ] Farmer created batch with QR code
- [ ] Supplier registered and verified
- [ ] Supplier scanned batch QR
- [ ] Supplier purchased batch (payment completed)
- [ ] Ownership transferred to supplier
- [ ] Industry registered and verified
- [ ] Industry scanned batch QR
- [ ] Industry purchased batch
- [ ] Ownership transferred to industry
- [ ] Industry created final product
- [ ] Final product has new QR code
- [ ] Consumer registered and verified
- [ ] Consumer scanned final product QR
- [ ] Complete journey visible to consumer

---

## 🎓 Pro Tips

1. **Save Environment Variables:** After each step, save the IDs and tokens in Postman environment for easy reuse.

2. **Use Console for OTP:** In test mode, always check the terminal for OTP instead of waiting for SMS.

3. **Test Phone Number:** Use `9999999999` for all roles in test mode (allowed due to non-unique phone handling).

4. **Unique Fields:** Make sure to use different Aadhar numbers, GST numbers, etc. for each user.

5. **Chain History:** After each transaction, scan the QR to see the updated chain history.

6. **Payment Testing:** Use cash payment option for faster testing without Razorpay integration.

---

## 🚀 Next Steps

After successful testing:
1. Integrate with mobile app
2. Add image upload (Cloudinary)
3. Test with real Razorpay credentials
4. Deploy to production
5. Test with real phone numbers

---

**Happy Testing! 🎉**

For issues, check the terminal logs or MongoDB database directly.
