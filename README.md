# 🌿 Herbal Supply Chain Tracking System - Backend

A comprehensive MERN stack backend for tracking medicinal herbs from farm to consumer, featuring role-based authentication, OTP verification, and complete supply chain management.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Database Models](#database-models)
- [Running the Application](#running-the-application)

---

## ✨ Features

### 🔐 Authentication System
- **Role-based registration** (Farmer, Supplier, Industry, Consumer)
- **OTP verification** via Twilio SMS
- **Phone number-based login**
- **JWT token authentication**
- **Resend OTP functionality**
- **Account approval workflow** for businesses

### 👥 User Roles

#### 👨‍🌾 Farmer
- Complete profile with personal details
- Aadhar card verification
- Farmer certificate upload
- Land documents management
- Crop tracking

#### 🚚 Supplier
- Driver's license verification
- Multiple vehicle management
- RC book uploads
- Delivery tracking
- Rating system

#### 🏭 Industry
- Comprehensive business registration
- GST & PAN verification
- Trade license management
- FSSAI & Drug license (optional)
- ISO certifications
- Production capacity tracking
- Compliance scoring

#### 👤 Consumer
- Simple phone-based registration
- QR code scanning history
- Product favorites
- Minimal data collection

### 📦 Supply Chain Features
- Collection event tracking
- Processing step management
- Quality test records
- Batch management
- Product packaging
- QR code generation
- Complete traceability

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **OTP Service:** Twilio SMS API
- **File Upload:** Cloudinary (ready to integrate)
- **Validation:** Mongoose schema validation
- **Security:** bcrypt for password/OTP hashing

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js       # Authentication logic
│   │   ├── batch.controller.js      # Batch management
│   │   ├── product.controller.js    # Product management
│   │   └── crops.controller.js      # Crop management
│   │
│   ├── models/
│   │   ├── farmer.model.js          # Farmer schema
│   │   ├── supplier.model.js        # Supplier schema
│   │   ├── industry.model.js        # Industry schema
│   │   ├── consumer.model.js        # Consumer schema
│   │   ├── collectionEvent.model.js # Collection tracking
│   │   ├── processingStep.model.js  # Processing tracking
│   │   ├── qualityTest.model.js     # Quality tests
│   │   ├── batch.model.js           # Batch management
│   │   └── product.model.js         # Product catalog
│   │
│   ├── routes/
│   │   ├── auth.routes.js           # Auth endpoints
│   │   ├── batch.routes.js          # Batch endpoints
│   │   ├── product.routes.js        # Product endpoints
│   │   └── crops.routes.js          # Crop endpoints
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js          # Global error handler
│   │   └── auth.middleware.js       # JWT verification
│   │
│   ├── utils/
│   │   ├── twilioService.js         # OTP sending & generation
│   │   ├── jwtHelper.js             # Token generation
│   │   └── modelHelper.js           # Role-based model selection
│   │
│   ├── db/
│   │   └── index.js                 # MongoDB connection
│   │
│   ├── app.js                       # Express app setup
│   └── index.js                     # Server entry point
│
├── public/                          # Static files
├── .env.example                     # Environment variables template
├── .gitignore
├── package.json
├── API_DOCUMENTATION.md             # Complete API docs
└── README.md                        # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Twilio account (for SMS OTP)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

---

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/herbal-supply-chain

# CORS
CORS_ORIGIN=*

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Twilio (Get from https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary (Optional - for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Getting Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/try-twilio)
2. Get a phone number with SMS capabilities
3. Copy your Account SID and Auth Token from the console
4. Add them to your `.env` file

---

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Start Endpoints

```bash
# Register a farmer
POST http://localhost:8000/api/v1/auth/register

# Verify registration OTP
POST http://localhost:8000/api/v1/auth/verify-registration

# Login (request OTP)
POST http://localhost:8000/api/v1/auth/login

# Verify login OTP
POST http://localhost:8000/api/v1/auth/verify-login

# Resend OTP
POST http://localhost:8000/api/v1/auth/resend-otp
```

---

## 👥 User Roles & Registration Requirements

### Farmer
**Required Documents:**
- Profile photo
- Aadhar card (number + image)
- Farmer certificate
- Address details

**Optional:**
- Land documents
- Farm size
- Crops grown

### Supplier
**Required Documents:**
- Profile photo
- Driving license (number + image + expiry)
- Vehicle details (number, type, RC book)
- Aadhar card

**Optional:**
- Business name
- GST number

### Industry
**Required Documents:**
- Company logo
- Authorized person details + Aadhar
- GST certificate + number
- PAN card + number
- Trade license

**Optional:**
- FSSAI license
- Drug license
- ISO certifications
- Factory images
- Bank details

### Consumer
**Required:**
- Phone number only

**Optional:**
- Name
- Email
- Profile photo

---

## 🗄️ Database Models

### User Models
- **Farmer** - Agricultural producers
- **Supplier** - Transportation providers
- **Industry** - Manufacturing companies
- **Consumer** - End users

### Supply Chain Models
- **CollectionEvent** - Herb collection records
- **ProcessingStep** - Processing activities
- **QualityTest** - Lab test results
- **Batch** - Supply chain batches
- **Product** - Final products with QR codes

---

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Production Mode
```bash
npm start
```

### Testing Endpoints
Use Postman, Thunder Client, or curl:

```bash
# Health check
curl http://localhost:8000/

# Register a consumer (simplest test)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "consumer",
    "phone": "9876543210"
  }'
```

---

## 🔒 Security Features

- **OTP Hashing:** All OTPs are hashed using bcrypt before storage
- **JWT Tokens:** Secure token-based authentication
- **Phone Validation:** Indian mobile number format validation
- **Aadhar Validation:** 12-digit Aadhar number validation
- **GST/PAN Validation:** Format validation for business documents
- **Rate Limiting:** Twilio provides built-in rate limiting
- **CORS:** Configurable cross-origin resource sharing

---

## 📱 Integration with Android App

### Authentication Flow

1. **Registration:**
   ```
   App → POST /auth/register → OTP sent via SMS
   App → POST /auth/verify-registration → Get JWT tokens
   ```

2. **Login:**
   ```
   App → POST /auth/login → OTP sent via SMS
   App → POST /auth/verify-login → Get JWT tokens
   ```

3. **Authenticated Requests:**
   ```
   App → Include "Authorization: Bearer <token>" header
   ```

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
- Verify your Twilio credentials in `.env`
- Check if your Twilio number has SMS capabilities
- Ensure you have sufficient Twilio credits
- Check phone number format (+91xxxxxxxxxx)

### OTP Expired Error
- OTP validity is 10 minutes
- Use the resend OTP endpoint to get a new code

---

## 📊 Database Schema Highlights

### Farmer Schema
```javascript
{
  name: String,
  phone: String (unique),
  dateOfBirth: Date,
  aadharNumber: String (unique),
  profileImage: String,
  aadharCardImage: String,
  farmerCertificate: String,
  address: Object,
  isVerified: Boolean,
  isApproved: Boolean,
  status: Enum
}
```

### Industry Schema
```javascript
{
  industryName: String,
  phone: String (unique),
  email: String (unique),
  gstNumber: String (unique),
  panNumber: String (unique),
  tradeLicense: Object,
  authorizedPerson: Object,
  certifications: Array,
  isVerified: Boolean,
  isApproved: Boolean
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team
- Check the API documentation

---

## 🎯 Next Steps

- [ ] Implement file upload with Cloudinary
- [ ] Add admin dashboard endpoints
- [ ] Implement batch tracking APIs
- [ ] Add QR code generation
- [ ] Create analytics endpoints
- [ ] Add email notifications
- [ ] Implement rate limiting
- [ ] Add API versioning
- [ ] Create automated tests

---

**Built with ❤️ for transparent herbal supply chain tracking**
