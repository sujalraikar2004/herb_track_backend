# 🚀 Quick Reference Card

## 📞 Phone Number Policy

✅ **Phone numbers are NOT unique** - Use the same number for testing all roles!

---

## 🔑 Unique Identifiers by Role

| Role     | Unique Fields                                    |
|----------|--------------------------------------------------|
| Farmer   | `aadharNumber`                                   |
| Supplier | `aadharNumber`, `drivingLicense.licenseNumber`   |
| Industry | `email`, `gstNumber`, `panNumber`, `tradeLicense.licenseNumber` |
| Consumer | None (can have duplicates)                       |

---

## 🌐 API Endpoints Quick Reference

### Authentication
```
POST   /api/v1/auth/register              # Register user
POST   /api/v1/auth/verify-registration   # Verify OTP
POST   /api/v1/auth/login                 # Request login OTP
POST   /api/v1/auth/verify-login          # Login with OTP
POST   /api/v1/auth/resend-otp            # Resend OTP
```

### Supply Chain
```
POST   /api/v1/supply-chain/batches/create           # Farmer creates batch
GET    /api/v1/supply-chain/batches/scan/:id         # Scan QR code
GET    /api/v1/supply-chain/batches/farmer/:id       # Get farmer batches
GET    /api/v1/supply-chain/batches/search           # Search batches
```

### Payments
```
POST   /api/v1/payments/create-order      # Create payment order
POST   /api/v1/payments/verify            # Verify Razorpay payment
POST   /api/v1/payments/cash-payment      # Complete cash payment
GET    /api/v1/payments/user/:id          # Get user payments
```

### Final Products
```
POST   /api/v1/final-products/create      # Create final product
GET    /api/v1/final-products/scan/:id    # Scan product QR
GET    /api/v1/final-products/industry/:id # Get industry products
GET    /api/v1/final-products/search      # Search products
```

---

## 🧪 Testing with One Phone Number

```bash
# Use phone: 9876543210 for ALL roles

# Farmer
POST /auth/register
{ "role": "farmer", "phone": "9876543210", "aadharNumber": "111111111111", ... }

# Supplier
POST /auth/register
{ "role": "supplier", "phone": "9876543210", "aadharNumber": "222222222222", ... }

# Industry
POST /auth/register
{ "role": "industry", "phone": "9876543210", "email": "test@test.com", ... }

# Consumer
POST /auth/register
{ "role": "consumer", "phone": "9876543210" }
```

**✅ All work with the same phone number!**

---

## 🔄 Complete Workflow

```
1. Farmer registers → Creates batch → Gets QR
2. Supplier scans QR → Sees farmer details → Pays
3. Industry scans QR → Sees farmer + supplier → Pays
4. Industry creates product → Gets new QR
5. Consumer scans product QR → Sees complete journey
```

---

## 🗄️ Environment Variables

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:3000
```

---

## 🚀 Start Server

```bash
npm run dev
```

Server runs on: `http://localhost:8000`

---

## 📚 Documentation Files

- `README.md` - Complete project guide
- `API_DOCUMENTATION.md` - Authentication APIs
- `SUPPLY_CHAIN_API.md` - Supply chain APIs
- `TESTING_GUIDE.md` - Testing instructions
- `PHONE_NUMBER_HANDLING.md` - Phone number policy
- `WORKFLOW_DIAGRAM.md` - Visual workflow
- `QUICKSTART.md` - Quick start guide
- `PROJECT_SUMMARY.md` - Implementation summary

---

## 🎯 Key Features

✅ Role-based authentication (4 roles)
✅ OTP verification via Twilio
✅ QR code auto-generation
✅ Complete traceability
✅ Razorpay + Cash payments
✅ GPS tracking
✅ Immutable audit trail
✅ Mobile-ready APIs

---

## 📱 Postman Collection

Import: `Herbal_Supply_Chain.postman_collection.json`

Set variable: `base_url = http://localhost:8000/api/v1`

---

## 🐛 Common Issues

**OTP not received?**
- Check Twilio credentials
- Check console logs for OTP
- Verify phone format

**User already exists?**
- Use different Aadhar/GST/PAN
- Phone can be same!

**MongoDB connection error?**
```bash
sudo systemctl start mongod
```

---

## ✨ What's Special

- No blockchain (pure MongoDB)
- Same phone for all roles (testing friendly)
- Complete farm-to-consumer traceability
- Multiple payment modes
- Auto QR generation
- GPS coordinates
- Immutable chain events

---

**🎉 Everything is ready! Start testing!**
