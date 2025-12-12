# 🔄 Complete System Workflow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     HERBAL SUPPLY CHAIN SYSTEM                  │
│                    (MongoDB + Express + Node.js)                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FARMER    │────▶│  SUPPLIER   │────▶│  INDUSTRY   │────▶│  CONSUMER   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                    │                    │
      ▼                    ▼                    ▼                    ▼
  Creates Batch       Scans QR           Scans QR           Scans Final
  Gets QR Code        Pays Farmer        Pays Supplier      Product QR
                      Owns Batch         Creates Product    Sees Journey
```

---

## Detailed Workflow

### PHASE 1: FARMER CREATES BATCH

```
┌──────────────────────────────────────────────────────────────┐
│ 1. FARMER REGISTRATION                                       │
├──────────────────────────────────────────────────────────────┤
│ POST /auth/register                                          │
│ {                                                            │
│   role: "farmer",                                            │
│   name: "Ramesh Kumar",                                      │
│   phone: "9876543210",                                       │
│   aadharNumber: "123456789012",                              │
│   profileImage: "...",                                       │
│   aadharCardImage: "...",                                    │
│   farmerCertificate: "...",                                  │
│   address: {...}                                             │
│ }                                                            │
│                                                              │
│ ↓ OTP sent via Twilio                                        │
│                                                              │
│ POST /auth/verify-registration                               │
│ { phone: "9876543210", otp: "123456", role: "farmer" }       │
│                                                              │
│ ✅ Farmer account created (status: pending approval)         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 2. FARMER CREATES BATCH                                      │
├──────────────────────────────────────────────────────────────┤
│ POST /supply-chain/batches/create                            │
│ {                                                            │
│   farmerId: "...",                                           │
│   herbName: "Ashwagandha",                                   │
│   harvestDate: "2025-12-10",                                 │
│   quantity: { value: 100, unit: "kg" },                      │
│   gpsCoordinates: { lat: 12.9716, lng: 77.5946 },            │
│   location: { village: "...", district: "...", state: "..." },│
│   qualityMetrics: { grade: "A+", purity: 98 },               │
│   farmerPrice: { amount: 5000 }                              │
│ }                                                            │
│                                                              │
│ ↓ Backend Processing                                         │
│                                                              │
│ 1. Create ProductBatch document                              │
│ 2. Generate unique batchId: "BATCH-ABC123"                   │
│ 3. Generate QR code (base64 + URL)                           │
│ 4. Set currentOwner = Farmer                                 │
│ 5. Create ChainEvent: "BatchCreated"                         │
│ 6. Status = "harvested"                                      │
│                                                              │
│ ✅ Response:                                                  │
│ {                                                            │
│   batch: {...},                                              │
│   qrCodeURL: "https://app.com/scan/batch/...",               │
│   qrCodeData: "data:image/png;base64,..."                    │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

### PHASE 2: SUPPLIER PURCHASES BATCH

```
┌──────────────────────────────────────────────────────────────┐
│ 3. SUPPLIER SCANS QR CODE                                    │
├──────────────────────────────────────────────────────────────┤
│ GET /supply-chain/batches/scan/:batchId                      │
│                                                              │
│ ✅ Response shows:                                            │
│ {                                                            │
│   batch: {                                                   │
│     batchId: "BATCH-ABC123",                                 │
│     herbName: "Ashwagandha",                                 │
│     quantity: { value: 100, unit: "kg" },                    │
│     gpsCoordinates: {...},                                   │
│     location: {...},                                         │
│     qualityMetrics: { grade: "A+", purity: 98 },             │
│     farmerPrice: { amount: 5000 },                           │
│     currentOwnerDetails: {                                   │
│       name: "Ramesh Kumar",                                  │
│       phone: "9876543210",                                   │
│       address: {...}                                         │
│     }                                                        │
│   },                                                         │
│   chainHistory: [                                            │
│     {                                                        │
│       eventType: "BatchCreated",                             │
│       performedBy: { userName: "Ramesh Kumar" },             │
│       timestamp: "2025-12-10T10:00:00Z"                      │
│     }                                                        │
│   ]                                                          │
│ }                                                            │
│                                                              │
│ 👁️ Supplier verifies:                                        │
│ ✓ Farmer identity                                            │
│ ✓ GPS location                                               │
│ ✓ Quality grade                                              │
│ ✓ Harvest date                                               │
│ ✓ Price                                                      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 4. SUPPLIER MAKES PAYMENT                                    │
├──────────────────────────────────────────────────────────────┤
│ Step 1: Create Payment Order                                 │
│ POST /payments/create-order                                  │
│ {                                                            │
│   batchId: "...",                                            │
│   payerId: "supplier_id",                                    │
│   payerType: "Supplier",                                     │
│   amount: 5000,                                              │
│   paymentMode: "Razorpay"  // or "Cash"                      │
│ }                                                            │
│                                                              │
│ ↓ Backend creates Payment document                           │
│ ↓ If Razorpay: creates Razorpay order                        │
│                                                              │
│ ✅ Response:                                                  │
│ {                                                            │
│   payment: { paymentId: "PAY-XYZ789", status: "pending" },   │
│   razorpayOrder: { id: "order_xxx", amount: 500000 }         │
│ }                                                            │
│                                                              │
│ ─────────────────────────────────────────────────────────────│
│                                                              │
│ Step 2: Complete Payment                                     │
│                                                              │
│ Option A: Razorpay                                           │
│ POST /payments/verify                                        │
│ {                                                            │
│   paymentId: "PAY-XYZ789",                                   │
│   razorpayOrderId: "order_xxx",                              │
│   razorpayPaymentId: "pay_xxx",                              │
│   razorpaySignature: "signature_xxx"                         │
│ }                                                            │
│                                                              │
│ Option B: Cash                                               │
│ POST /payments/cash-payment                                  │
│ {                                                            │
│   paymentId: "PAY-XYZ789",                                   │
│   receivedBy: "Ramesh Kumar",                                │
│   receiptNumber: "RCPT-001",                                 │
│   witnessName: "...",                                        │
│   witnessPhone: "..."                                        │
│ }                                                            │
│                                                              │
│ ↓ Backend Processing:                                        │
│                                                              │
│ 1. Verify payment (signature for Razorpay)                   │
│ 2. Update Payment status = "completed"                       │
│ 3. Transfer batch ownership to Supplier                      │
│ 4. Update batch status = "with_supplier"                     │
│ 5. Create ChainEvent: "SupplierPurchase"                     │
│ 6. Add event to batch.chainEvents                            │
│                                                              │
│ ✅ Ownership transferred!                                     │
└──────────────────────────────────────────────────────────────┘
```

### PHASE 3: INDUSTRY PURCHASES FROM SUPPLIER

```
┌──────────────────────────────────────────────────────────────┐
│ 5. INDUSTRY SCANS SAME QR CODE                               │
├──────────────────────────────────────────────────────────────┤
│ GET /supply-chain/batches/scan/:batchId                      │
│                                                              │
│ ✅ Response now shows:                                        │
│ {                                                            │
│   batch: {                                                   │
│     batchId: "BATCH-ABC123",                                 │
│     status: "with_supplier",                                 │
│     currentOwnerDetails: {                                   │
│       name: "Suresh Patil",  ← Now supplier                  │
│       phone: "9876543211"                                    │
│     }                                                        │
│   },                                                         │
│   chainHistory: [                                            │
│     {                                                        │
│       eventType: "BatchCreated",                             │
│       performedBy: { userName: "Ramesh Kumar" },             │
│       timestamp: "2025-12-10T10:00:00Z"                      │
│     },                                                       │
│     {                                                        │
│       eventType: "SupplierPurchase",  ← New event            │
│       performedBy: { userName: "Suresh Patil" },             │
│       transaction: {                                         │
│         amount: 5000,                                        │
│         paymentMode: "Razorpay",                             │
│         paymentStatus: "completed"                           │
│       },                                                     │
│       timestamp: "2025-12-10T14:00:00Z"                      │
│     }                                                        │
│   ]                                                          │
│ }                                                            │
│                                                              │
│ 👁️ Industry sees:                                            │
│ ✓ Original farmer details                                    │
│ ✓ Supplier who transported                                   │
│ ✓ All payment records                                        │
│ ✓ Complete chain of custody                                  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 6. INDUSTRY MAKES PAYMENT TO SUPPLIER                        │
├──────────────────────────────────────────────────────────────┤
│ Same process as Supplier → Farmer:                           │
│                                                              │
│ 1. POST /payments/create-order                               │
│ 2. POST /payments/verify (or cash-payment)                   │
│                                                              │
│ ↓ Backend Processing:                                        │
│                                                              │
│ 1. Transfer ownership to Industry                            │
│ 2. Update status = "with_industry"                           │
│ 3. Create ChainEvent: "IndustryPurchase"                     │
│                                                              │
│ ✅ Industry now owns the batch!                               │
└──────────────────────────────────────────────────────────────┘
```

### PHASE 4: INDUSTRY CREATES FINAL PRODUCT

```
┌──────────────────────────────────────────────────────────────┐
│ 7. INDUSTRY CREATES FINAL PRODUCT                            │
├──────────────────────────────────────────────────────────────┤
│ POST /final-products/create                                  │
│ {                                                            │
│   industryId: "...",                                         │
│   sourceBatches: ["batch_id_1", "batch_id_2"],               │
│   productName: "Ashwagandha Capsules",                       │
│   brandName: "Himalaya",                                     │
│   productType: "capsule",                                    │
│   category: "ayurvedic",                                     │
│   ingredients: [...],                                        │
│   manufacturingDate: "2025-12-11",                           │
│   expiryDate: "2027-12-11",                                  │
│   labTests: [...],                                           │
│   certifications: [...],                                     │
│   mrp: { amount: 499 }                                       │
│ }                                                            │
│                                                              │
│ ↓ Backend Processing:                                        │
│                                                              │
│ 1. Verify industry owns all source batches                   │
│ 2. Create FinalProduct document                              │
│ 3. Generate NEW QR code for product                          │
│ 4. Collect ALL chain events from source batches              │
│ 5. Store complete traceability chain                         │
│ 6. Update source batches status = "processed"                │
│ 7. Create "Processing" chain events                          │
│                                                              │
│ ✅ Response:                                                  │
│ {                                                            │
│   finalProduct: {                                            │
│     productId: "PROD-ABC123",                                │
│     productName: "Ashwagandha Capsules",                     │
│     qrCodeURL: "https://app.com/scan/product/...",           │
│     qrCodeData: "data:image/png;base64,..."                  │
│   }                                                          │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

### PHASE 5: CONSUMER SCANS FINAL PRODUCT

```
┌──────────────────────────────────────────────────────────────┐
│ 8. CONSUMER SCANS FINAL PRODUCT QR                           │
├──────────────────────────────────────────────────────────────┤
│ GET /final-products/scan/:productId                          │
│                                                              │
│ ✅ Response shows COMPLETE JOURNEY:                           │
│ {                                                            │
│   product: {                                                 │
│     productName: "Ashwagandha Capsules",                     │
│     brandName: "Himalaya",                                   │
│     mrp: { amount: 499 },                                    │
│     manufacturingDate: "2025-12-11",                         │
│     expiryDate: "2027-12-11"                                 │
│   },                                                         │
│   journey: {                                                 │
│     farmers: [                                               │
│       {                                                      │
│         name: "Ramesh Kumar",                                │
│         phone: "9876543210",                                 │
│         address: {                                           │
│           village: "Kothapalli",                             │
│           district: "Kodagu",                                │
│           state: "Karnataka"                                 │
│         },                                                   │
│         batchDetails: {                                      │
│           batchId: "BATCH-ABC123",                           │
│           herbName: "Ashwagandha",                           │
│           harvestDate: "2025-12-10",                         │
│           quantity: { value: 100, unit: "kg" },              │
│           gpsCoordinates: {                                  │
│             latitude: 12.9716,                               │
│             longitude: 77.5946                               │
│           },                                                 │
│           qualityMetrics: {                                  │
│             grade: "A+",                                     │
│             purity: 98,                                      │
│             organicCertified: true                           │
│           }                                                  │
│         }                                                    │
│       }                                                      │
│     ],                                                       │
│     suppliers: [                                             │
│       {                                                      │
│         name: "Suresh Patil",                                │
│         phone: "9876543211",                                 │
│         timestamp: "2025-12-10T14:00:00Z",                   │
│         transaction: {                                       │
│           amount: 5000,                                      │
│           paymentMode: "UPI"                                 │
│         }                                                    │
│       }                                                      │
│     ],                                                       │
│     industry: {                                              │
│       name: "Himalaya Wellness Company",                     │
│       phone: "9876543212",                                   │
│       email: "contact@himalaya.com",                         │
│       address: {                                             │
│         city: "Bangalore",                                   │
│         state: "Karnataka"                                   │
│       }                                                      │
│     },                                                       │
│     finalProduct: {                                          │
│       certifications: [                                      │
│         { name: "GMP Certified", issuedBy: "WHO" }           │
│       ],                                                     │
│       labTests: [                                            │
│         {                                                    │
│           testName: "Heavy Metal Test",                      │
│           result: "Pass",                                    │
│           labName: "SGS Labs"                                │
│         }                                                    │
│       ],                                                     │
│       ingredients: [...],                                    │
│       benefits: [                                            │
│         "Reduces stress",                                    │
│         "Improves immunity"                                  │
│       ]                                                      │
│     }                                                        │
│   },                                                         │
│   totalScans: 156                                            │
│ }                                                            │
│                                                              │
│ 🎉 Consumer sees EVERYTHING:                                 │
│ ✓ Where herb was grown (GPS location)                        │
│ ✓ Who grew it (Farmer name, photo)                           │
│ ✓ When it was harvested                                      │
│ ✓ Quality grade                                              │
│ ✓ Who transported it                                         │
│ ✓ Who manufactured it                                        │
│ ✓ All payment records                                        │
│ ✓ Lab test results                                           │
│ ✓ Certifications                                             │
│ ✓ Complete transparency!                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Database State After Complete Workflow

```
ProductBatch Collection:
{
  _id: "...",
  batchId: "BATCH-ABC123",
  farmerId: "farmer_id",
  herbName: "Ashwagandha",
  status: "processed",
  currentOwner: {
    ownerId: "industry_id",
    ownerType: "Industry"
  },
  chainEvents: [
    "event_1_id",  // BatchCreated
    "event_2_id",  // SupplierPurchase
    "event_3_id",  // IndustryPurchase
    "event_4_id"   // Processing
  ],
  finalProduct: "product_id",
  qrCodeURL: "...",
  qrCodeData: "..."
}

ChainEvent Collection:
[
  {
    eventType: "BatchCreated",
    performedBy: { userId: "farmer_id", userType: "Farmer" },
    timestamp: "2025-12-10T10:00:00Z"
  },
  {
    eventType: "SupplierPurchase",
    performedBy: { userId: "supplier_id", userType: "Supplier" },
    transaction: { paymentId: "pay_1", amount: 5000 },
    timestamp: "2025-12-10T14:00:00Z"
  },
  {
    eventType: "IndustryPurchase",
    performedBy: { userId: "industry_id", userType: "Industry" },
    transaction: { paymentId: "pay_2", amount: 7000 },
    timestamp: "2025-12-10T18:00:00Z"
  },
  {
    eventType: "Processing",
    performedBy: { userId: "industry_id", userType: "Industry" },
    metadata: { productId: "PROD-ABC123" },
    timestamp: "2025-12-11T10:00:00Z"
  }
]

Payment Collection:
[
  {
    paymentId: "PAY-1",
    payer: { userId: "supplier_id", userType: "Supplier" },
    payee: { userId: "farmer_id", userType: "Farmer" },
    amount: 5000,
    status: "completed"
  },
  {
    paymentId: "PAY-2",
    payer: { userId: "industry_id", userType: "Industry" },
    payee: { userId: "supplier_id", userType: "Supplier" },
    amount: 7000,
    status: "completed"
  }
]

FinalProduct Collection:
{
  productId: "PROD-ABC123",
  industryId: "industry_id",
  sourceBatches: ["batch_id"],
  productName: "Ashwagandha Capsules",
  traceabilityChain: [
    "event_1_id",
    "event_2_id",
    "event_3_id",
    "event_4_id"
  ],
  qrCodeURL: "...",
  totalScans: 156
}
```

---

## 🎯 Key Takeaways

1. **Single QR Code** - Same QR follows the batch through the supply chain
2. **Ownership Transfer** - Automatic on payment verification
3. **Immutable Chain** - Every transaction recorded permanently
4. **Complete Transparency** - Consumer sees everything
5. **GPS Tracking** - Exact harvest location
6. **Payment Integration** - Razorpay + Cash support
7. **No Blockchain** - Pure MongoDB for simplicity
8. **Mobile Ready** - All APIs return JSON for apps

---

**This is the complete end-to-end workflow of your herbal supply chain traceability system! 🌿**
