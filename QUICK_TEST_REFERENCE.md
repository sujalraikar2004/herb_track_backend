# 🚀 Quick Test Reference Card

## 📦 Import to Postman
1. Open Postman
2. Import: `Complete_Supply_Chain_Testing.postman_collection.json`
3. This collection has **17 requests** organized in **4 phases**

## ⚙️ Environment Setup
Create environment with these variables:
```
base_url = http://localhost:8000/api/v1
test_phone = 9999999999
```

All other variables (farmerId, tokens, etc.) are **auto-saved** by the collection!

---

## 🎯 Testing Flow (17 Steps)

### PHASE 1: FARMER (Steps 1-3)
1. ✅ Register Farmer → Get `farmerId`
2. ✅ Verify OTP (from console) → Get `farmerToken`
3. ✅ Create Batch → Get `batchId` + QR Code

**Check console for:** `🧪 TEST OTP: 123456`

---

### PHASE 2: SUPPLIER (Steps 4-8)
4. ✅ Register Supplier → Get `supplierId`
5. ✅ Verify OTP → Get `supplierToken`
6. ✅ Scan Batch QR → See farmer details
7. ✅ Create Payment → Get `paymentId`
8. ✅ Complete Cash Payment → Ownership transferred

**Result:** Batch owner = Supplier

---

### PHASE 3: INDUSTRY (Steps 9-14)
9. ✅ Register Industry → Get `industryId`
10. ✅ Verify OTP → Get `industryToken`
11. ✅ Scan Batch QR → See farmer + supplier chain
12. ✅ Create Payment → Get `paymentId2`
13. ✅ Complete Cash Payment → Ownership transferred
14. ✅ Create Final Product → Get `productId` + New QR Code

**Result:** Final product created with new QR

---

### PHASE 4: CONSUMER (Steps 15-17)
15. ✅ Register Consumer → Get `consumerId`
16. ✅ Verify OTP → Get `consumerToken`
17. ✅ Scan Final Product QR → **SEE COMPLETE JOURNEY! 🎉**

**Result:** Complete traceability visible!

---

## 📋 What Consumer Sees (Step 17)

```json
{
  "journey": {
    "farmers": [
      {
        "name": "Ramesh Kumar",
        "village": "Kothapalli",
        "district": "Kodagu",
        "herbName": "Ashwagandha",
        "harvestDate": "2025-12-10",
        "gpsCoordinates": { "lat": 12.9716, "lng": 77.5946 },
        "qualityGrade": "A+"
      }
    ],
    "suppliers": [
      {
        "name": "Suresh Patil",
        "businessName": "Patil Transport",
        "transaction": { "amount": 5000 }
      }
    ],
    "industry": {
      "name": "Himalaya Wellness",
      "certifications": ["GMP Certified"],
      "labTests": ["Heavy Metal Test - Pass"]
    },
    "finalProduct": {
      "productName": "Ashwagandha Capsules",
      "mrp": 499,
      "benefits": ["Reduces stress", "Improves immunity"]
    }
  }
}
```

---

## 🔑 Key Points

### OTP Handling
- **Test Mode:** OTP shown in console
- **Look for:** `🧪 TEST OTP: 123456`
- **Validity:** 10 minutes
- **Default OTP:** Usually `123456` in test mode

### Phone Number
- **Same for all:** `9999999999`
- **Why?** Test mode allows non-unique phones
- **Different:** Aadhar, GST, PAN must be unique

### Auto-Saved Variables
The collection automatically saves:
- ✅ All user IDs (farmerId, supplierId, etc.)
- ✅ All tokens (farmerToken, supplierToken, etc.)
- ✅ batchId, paymentId, productId
- ✅ No manual copying needed!

### Payment Options
**Option A: Razorpay** (requires valid signature)
**Option B: Cash Payment** (easier for testing) ✅

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "User already exists" | Use login instead, or delete from MongoDB |
| "OTP not in console" | Check `NODE_ENV=development` in `.env` |
| "Invalid OTP" | OTP expires in 10 min, request new one |
| "Batch not found" | Make sure batchId is saved correctly |
| "Cannot create product" | Complete industry payment first (Step 13) |

---

## 📊 Testing Checklist

```
PHASE 1 - FARMER
[ ] Farmer registered
[ ] Farmer verified
[ ] Batch created with QR

PHASE 2 - SUPPLIER
[ ] Supplier registered
[ ] Supplier verified
[ ] Supplier scanned batch
[ ] Supplier paid farmer
[ ] Ownership transferred

PHASE 3 - INDUSTRY
[ ] Industry registered
[ ] Industry verified
[ ] Industry scanned batch
[ ] Industry paid supplier
[ ] Ownership transferred
[ ] Final product created

PHASE 4 - CONSUMER
[ ] Consumer registered
[ ] Consumer verified
[ ] Consumer scanned product
[ ] Complete journey visible ✅
```

---

## 🎓 Pro Tips

1. **Run in Order:** Execute requests 1-17 sequentially
2. **Check Console:** After each registration, check terminal for OTP
3. **Auto Variables:** Collection saves IDs/tokens automatically
4. **View Response:** Check "Test Results" tab for console logs
5. **Cash Payment:** Use cash payment for faster testing

---

## 📱 Expected Timeline

- **Setup:** 2 minutes
- **Phase 1 (Farmer):** 2 minutes
- **Phase 2 (Supplier):** 3 minutes
- **Phase 3 (Industry):** 4 minutes
- **Phase 4 (Consumer):** 2 minutes
- **Total:** ~15 minutes for complete flow

---

## 🎉 Success Indicators

After Step 17, you should see:
- ✅ Complete farmer details with GPS
- ✅ Supplier transaction history
- ✅ Industry certifications
- ✅ Lab test results
- ✅ Product benefits and usage
- ✅ Complete transparency!

---

## 📞 Need Help?

1. Check terminal logs for errors
2. Verify MongoDB connection
3. Ensure server is running on port 8000
4. Review `POSTMAN_COMPLETE_TESTING_GUIDE.md` for details

---

**Happy Testing! 🚀**

*Complete supply chain traceability in 17 easy steps!*
