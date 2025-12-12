# 🚀 Quick Start Guide

## Prerequisites
- Node.js v16+
- MongoDB running
- Twilio account (for OTP)
- Razorpay account (for payments)

## Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain

# Twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# JWT
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB
```bash
# Linux
sudo systemctl start mongod

# Mac
brew services start mongodb-community

# Windows
net start MongoDB
```

### 4. Run the Server
```bash
npm run dev
```

Server will start on `http://localhost:8000`

---

## 🧪 Testing the API

### Test 1: Register a Consumer (Simplest)
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "consumer",
    "phone": "9876543210"
  }'
```

### Test 2: Verify OTP
```bash
curl -X POST http://localhost:8000/api/v1/auth/verify-registration \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "role": "consumer"
  }'
```

### Test 3: Create a Batch (Farmer)
First register a farmer, then:
```bash
curl -X POST http://localhost:8000/api/v1/supply-chain/batches/create \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "YOUR_FARMER_ID",
    "herbName": "Ashwagandha",
    "harvestDate": "2025-12-10",
    "quantity": {
      "value": 100,
      "unit": "kg"
    },
    "gpsCoordinates": {
      "latitude": 12.9716,
      "longitude": 77.5946
    },
    "location": {
      "village": "Test Village",
      "district": "Test District",
      "state": "Karnataka"
    },
    "farmerPrice": {
      "amount": 5000
    }
  }'
```

---

## 📚 API Documentation

- **Authentication:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Supply Chain:** [SUPPLY_CHAIN_API.md](./SUPPLY_CHAIN_API.md)

---

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── supplyChain.controller.js
│   │   ├── payment.controller.js
│   │   └── finalProduct.controller.js
│   │
│   ├── models/
│   │   ├── farmer.model.js
│   │   ├── supplier.model.js
│   │   ├── industry.model.js
│   │   ├── consumer.model.js
│   │   ├── productBatch.model.js
│   │   ├── chainEvent.model.js
│   │   ├── payment.model.js
│   │   └── finalProduct.model.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── supplyChain.routes.js
│   │   ├── payment.routes.js
│   │   └── finalProduct.routes.js
│   │
│   ├── utils/
│   │   ├── twilioService.js
│   │   ├── razorpayService.js
│   │   ├── qrCodeService.js
│   │   ├── jwtHelper.js
│   │   └── modelHelper.js
│   │
│   └── app.js
│
└── README.md
```

---

## 🔄 Complete Workflow

### 1. Farmer Journey
1. Register → Verify OTP → Login
2. Create batch → Get QR code
3. Wait for supplier to purchase

### 2. Supplier Journey
1. Register → Verify OTP → Login
2. Scan farmer's QR code
3. See all batch details
4. Make payment (Razorpay/Cash)
5. Become batch owner

### 3. Industry Journey
1. Register → Verify OTP → Login
2. Scan supplier's QR code (same QR)
3. See farmer + supplier details
4. Make payment
5. Become batch owner
6. Create final product
7. Get new QR for final product

### 4. Consumer Journey
1. Register → Verify OTP (optional)
2. Scan final product QR
3. See complete journey:
   - Farmer details
   - Supplier details
   - Industry details
   - All transactions
   - Lab tests
   - Certifications

---

## 🎯 Key Features Implemented

✅ Role-based registration (Farmer/Supplier/Industry/Consumer)
✅ OTP verification via Twilio
✅ Phone number-based login
✅ Batch creation with auto QR generation
✅ QR scanning with complete chain history
✅ Payment integration (Razorpay + Cash)
✅ Ownership transfer on payment
✅ Chain event tracking
✅ Final product creation
✅ Complete traceability from farm to consumer
✅ GPS coordinates tracking
✅ Quality metrics
✅ Lab tests and certifications
✅ Multiple payment modes
✅ Immutable audit trail

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Twilio SMS Not Sending
- Verify credentials in `.env`
- Check Twilio console for errors
- Ensure phone number has SMS capability
- Check Twilio balance

### Razorpay Payment Failing
- Verify API keys in `.env`
- Check Razorpay dashboard
- Ensure test mode is enabled for testing

---

## 📞 Support

For issues:
1. Check logs in terminal
2. Verify MongoDB is running
3. Check `.env` configuration
4. Review API documentation

---

**Happy Coding! 🚀**
