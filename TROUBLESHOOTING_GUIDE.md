# 🔧 Troubleshooting Guide - Common Issues & Solutions

## 📋 Quick Diagnosis

### Is your server running?
```bash
# Check if server is running
curl http://localhost:8000/api/v1/health

# If not, start it:
cd /home/sujal/Desktop/sih/backend
npm run dev
```

### Is MongoDB connected?
Check terminal for: `✅ MongoDB connected successfully`

---

## 🚨 Common Errors & Solutions

### 1. Registration Errors

#### Error: "User already exists"
```json
{
  "success": false,
  "message": "User already exists with this phone number"
}
```

**Cause:** You're trying to register the same role twice with the same phone.

**Solutions:**
1. **Use Login instead:**
   ```
   POST /auth/login
   { "phone": "9999999999" }
   ```

2. **Delete from MongoDB:**
   ```bash
   # Connect to MongoDB
   mongosh
   use herbal-supply-chain
   
   # Delete specific user
   db.farmers.deleteOne({ phone: "9999999999" })
   # OR
   db.suppliers.deleteOne({ phone: "9999999999" })
   # OR
   db.industries.deleteOne({ phone: "9999999999" })
   # OR
   db.consumers.deleteOne({ phone: "9999999999" })
   ```

3. **Use different phone number** (not recommended in test mode)

---

#### Error: "Duplicate key error: aadharNumber"
```json
{
  "success": false,
  "message": "E11000 duplicate key error collection: aadharNumber"
}
```

**Cause:** You're using the same Aadhar number for multiple users.

**Solution:** Use different Aadhar numbers:
```json
// Farmer
"aadharNumber": "123456789001"

// Supplier
"aadharNumber": "123456789002"

// Industry authorized person
"aadharNumber": "123456789003"
```

---

#### Error: "Duplicate key error: email"
```json
{
  "success": false,
  "message": "E11000 duplicate key error collection: email"
}
```

**Cause:** Email already exists (for Industry).

**Solution:** Use different emails:
```json
"email": "contact@himalaya.test"
"email": "info@patanjali.test"
"email": "support@dabur.test"
```

---

### 2. OTP Errors

#### Error: "OTP not found in console"

**Cause:** Test mode not enabled or console not visible.

**Solutions:**

1. **Check `.env` file:**
   ```env
   NODE_ENV=development
   TEST_MODE=true
   ```

2. **Restart server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Look for this in terminal:**
   ```
   🧪 TEST MODE: Skipping SMS to +919999999999
   🧪 TEST OTP: 123456 (Use this for verification)
   ```

---

#### Error: "Invalid or expired OTP"
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**Causes & Solutions:**

1. **OTP Expired (10 minutes)**
   ```
   Solution: Request new OTP
   POST /auth/resend-otp
   { "phone": "9999999999", "role": "farmer" }
   ```

2. **Wrong OTP entered**
   ```
   Solution: Copy exact OTP from console
   Look for: 🧪 TEST OTP: 123456
   ```

3. **OTP already used**
   ```
   Solution: Request new OTP or use login
   ```

---

### 3. Batch Errors

#### Error: "Batch not found"
```json
{
  "success": false,
  "message": "Batch not found"
}
```

**Cause:** Using wrong batch ID.

**Solutions:**

1. **Check saved batchId:**
   - In Postman, check environment variable `batchId`
   - Should be MongoDB ObjectId (e.g., `675a1b2c3d4e5f6g7h8i9j0`)

2. **Get farmer's batches:**
   ```
   GET /supply-chain/batches/farmer/{{farmerId}}
   ```

3. **Verify batch was created:**
   - Check response from Step 3 (Create Batch)
   - Save `_id` field, not `batchId` field

---

#### Error: "Batch already sold"
```json
{
  "success": false,
  "message": "Batch has already been sold"
}
```

**Cause:** Trying to purchase a batch that's already been purchased.

**Solution:** Create a new batch or use a different batch.

---

### 4. Payment Errors

#### Error: "Invalid payment verification"
```json
{
  "success": false,
  "message": "Invalid payment signature"
}
```

**Cause:** Razorpay signature verification failed.

**Solution:** Use **Cash Payment** for testing:
```json
POST /payments/cash-payment
{
  "paymentId": "{{paymentId}}",
  "receivedBy": "Receiver Name",
  "receiptNumber": "RCPT-001",
  "witnessName": "Witness",
  "witnessPhone": "9876543212"
}
```

---

#### Error: "Payment not found"
```json
{
  "success": false,
  "message": "Payment not found"
}
```

**Cause:** Wrong payment ID or payment wasn't created.

**Solutions:**

1. **Check saved paymentId:**
   - Should be saved from Step 7 or 12
   - Format: `PAY-XXXXX`

2. **Create payment first:**
   ```
   POST /payments/create-order
   ```

3. **Get user payments:**
   ```
   GET /payments/user/{{supplierId}}?type=all
   ```

---

### 5. Final Product Errors

#### Error: "Cannot create final product - batch not owned by industry"
```json
{
  "success": false,
  "message": "You do not own this batch"
}
```

**Cause:** Industry hasn't purchased the batch yet.

**Solution:** Complete payment first (Steps 12-13):
```
1. POST /payments/create-order
2. POST /payments/cash-payment
3. Then POST /final-products/create
```

---

#### Error: "Source batch not found"
```json
{
  "success": false,
  "message": "Source batch not found"
}
```

**Cause:** Wrong batch ID in `sourceBatches` array.

**Solution:** Use correct batch ID:
```json
{
  "sourceBatches": ["{{batchId}}"],  // Use saved batchId
  ...
}
```

---

### 6. Authorization Errors

#### Error: "No authorization token provided"
```json
{
  "success": false,
  "message": "No authorization token provided"
}
```

**Cause:** Missing Authorization header.

**Solution:** Add header to request:
```
Authorization: Bearer {{farmerToken}}
```

In Postman:
1. Go to Headers tab
2. Add: `Authorization` = `Bearer {{farmerToken}}`

---

#### Error: "Invalid token"
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**Cause:** Token expired or invalid.

**Solution:** Login again:
```
1. POST /auth/login
2. POST /auth/verify-login
3. Save new token
```

---

### 7. Validation Errors

#### Error: "Validation failed"
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

**Common Causes:**

1. **Missing required fields:**
   ```
   Solution: Check API documentation for required fields
   ```

2. **Invalid date format:**
   ```
   Wrong: "2025/12/10"
   Correct: "2025-12-10"
   ```

3. **Invalid phone format:**
   ```
   Wrong: "+91-9999999999"
   Correct: "9999999999"
   ```

4. **Invalid GPS coordinates:**
   ```json
   {
     "gpsCoordinates": {
       "latitude": 12.9716,    // Must be number
       "longitude": 77.5946,   // Must be number
       "accuracy": 10          // Optional
     }
   }
   ```

---

### 8. Network Errors

#### Error: "Could not get response" (Postman)

**Causes & Solutions:**

1. **Server not running:**
   ```bash
   cd /home/sujal/Desktop/sih/backend
   npm run dev
   ```

2. **Wrong URL:**
   ```
   Correct: http://localhost:8000/api/v1
   Wrong: http://localhost:3000/api/v1
   ```

3. **Firewall blocking:**
   ```bash
   # Check if port is open
   sudo ufw allow 8000
   ```

---

### 9. MongoDB Errors

#### Error: "MongoServerError: connection refused"

**Cause:** MongoDB not running.

**Solution:**
```bash
# Start MongoDB
sudo systemctl start mongod

# Check status
sudo systemctl status mongod

# Enable auto-start
sudo systemctl enable mongod
```

---

#### Error: "MongoServerSelectionError"

**Cause:** MongoDB connection string wrong or MongoDB not accessible.

**Solutions:**

1. **Check `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain
   ```

2. **Test connection:**
   ```bash
   mongosh mongodb://localhost:27017/herbal-supply-chain
   ```

3. **Check MongoDB is running:**
   ```bash
   sudo systemctl status mongod
   ```

---

### 10. Postman Collection Errors

#### Error: "Variable not found"

**Cause:** Environment variable not set.

**Solution:**

1. **Create environment:**
   - Click "Environments" in Postman
   - Create new environment
   - Add variables:
     ```
     base_url = http://localhost:8000/api/v1
     test_phone = 9999999999
     ```

2. **Select environment:**
   - Top-right dropdown in Postman
   - Select your environment

3. **Check auto-saved variables:**
   - After each request, check if variables are saved
   - Look in "Test Results" tab for console logs

---

## 🔍 Debugging Tips

### 1. Check Terminal Logs
Always monitor your backend terminal for:
- ✅ Success messages
- ❌ Error messages
- 🧪 Test OTP codes
- 📊 Request logs

### 2. Check MongoDB
```bash
mongosh
use herbal-supply-chain

# Check collections
show collections

# Check users
db.farmers.find()
db.suppliers.find()
db.industries.find()
db.consumers.find()

# Check batches
db.productbatches.find()

# Check payments
db.payments.find()

# Check final products
db.finalproducts.find()

# Check chain events
db.chainevents.find()
```

### 3. Check Postman Console
- View → Show Postman Console
- See all requests/responses
- Check for errors

### 4. Test Individual Endpoints
Don't run all 17 steps at once. Test phase by phase:
1. Test Phase 1 (Farmer) completely
2. Then Phase 2 (Supplier)
3. Then Phase 3 (Industry)
4. Finally Phase 4 (Consumer)

---

## 📊 Verification Checklist

After each phase, verify:

### After Phase 1 (Farmer):
```bash
# Check MongoDB
db.farmers.findOne({ phone: "9999999999" })
db.productbatches.findOne({ farmerId: ObjectId("...") })

# Should see:
✅ Farmer document exists
✅ Batch document exists
✅ Batch has qrCodeURL
✅ Batch status is "harvested"
```

### After Phase 2 (Supplier):
```bash
# Check MongoDB
db.suppliers.findOne({ phone: "9999999999" })
db.payments.findOne({ payerId: ObjectId("...") })
db.chainevents.find({ batchId: ObjectId("...") })

# Should see:
✅ Supplier document exists
✅ Payment status is "completed"
✅ Batch currentOwner is Supplier
✅ Batch status is "with_supplier"
✅ ChainEvent "SupplierPurchase" exists
```

### After Phase 3 (Industry):
```bash
# Check MongoDB
db.industries.findOne({ phone: "9999999999" })
db.finalproducts.findOne({ industryId: ObjectId("...") })

# Should see:
✅ Industry document exists
✅ Payment to supplier completed
✅ Batch currentOwner is Industry
✅ Final product created
✅ Final product has qrCodeURL
✅ Source batch status is "processed"
```

### After Phase 4 (Consumer):
```bash
# Check MongoDB
db.consumers.findOne({ phone: "9999999999" })

# Should see:
✅ Consumer document exists
✅ Consumer can scan product QR
✅ Complete journey visible
```

---

## 🆘 Still Having Issues?

### 1. Reset Everything
```bash
# Stop server
Ctrl+C

# Clear MongoDB
mongosh
use herbal-supply-chain
db.dropDatabase()

# Restart server
npm run dev

# Start testing from Step 1
```

### 2. Check Environment Variables
```bash
cat .env

# Should have:
NODE_ENV=development
TEST_MODE=true
MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=8000
```

### 3. Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### 4. Check Logs
```bash
# View recent logs
tail -f /var/log/mongodb/mongod.log

# Check for errors
grep -i error /var/log/mongodb/mongod.log
```

---

## 📞 Getting Help

If you're still stuck:

1. **Check the error message carefully** - It usually tells you what's wrong
2. **Review the documentation:**
   - `POSTMAN_COMPLETE_TESTING_GUIDE.md`
   - `QUICK_TEST_REFERENCE.md`
   - `VISUAL_WORKFLOW_GUIDE.md`
   - `API_DOCUMENTATION.md`
   - `SUPPLY_CHAIN_API.md`

3. **Check MongoDB directly** to see what's actually stored

4. **Test with a REST client** like Thunder Client or Insomnia to rule out Postman issues

---

## ✅ Success Indicators

You know everything is working when:

1. ✅ Server starts without errors
2. ✅ MongoDB connection successful
3. ✅ OTP appears in console
4. ✅ Users register successfully
5. ✅ Batches create with QR codes
6. ✅ Payments complete successfully
7. ✅ Ownership transfers work
8. ✅ Final products create successfully
9. ✅ Consumer sees complete journey

---

**Happy Debugging! 🐛🔧**

*Most issues are simple configuration problems. Check the basics first!*
