import { TestDataGenerator } from '../src/utils/testDataGenerator.js';
import { TEST_OTP, TEST_PHONE_NUMBER } from '../src/constants.js';

const BASE_URL = 'http://localhost:8000/api/v1';

// Helper for delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log('🚀 Starting Complete Project Test...');
    console.log(`ℹ️  Using Test Phone: ${TEST_PHONE_NUMBER}`);
    console.log(`ℹ️  Using Test OTP: ${TEST_OTP}`);

    try {
        // 1. Register Farmer
        console.log('\n👨‍🌾 Testing Farmer Registration...');
        const farmerData = {
            name: "Test Farmer",
            phone: TEST_PHONE_NUMBER,
            dateOfBirth: "1990-01-01",
            aadharNumber: TestDataGenerator.aadhar(),
            profileImage: "https://example.com/profile.jpg",
            aadharCardImage: "https://example.com/aadhar.jpg",
            farmerCertificate: "https://example.com/cert.jpg",
            address: {
                street: "123 Farm Road",
                city: "Farmville",
                state: "Karnataka",
                zipCode: "560001"
            }
        };

        await registerUser('farmer', farmerData);
        await verifyOtp('farmer');
        await loginUser('farmer');

        // 2. Register Supplier
        console.log('\n🚚 Testing Supplier Registration...');
        const supplierData = {
            name: "Test Supplier",
            phone: TEST_PHONE_NUMBER,
            dateOfBirth: "1985-05-15",
            aadharNumber: TestDataGenerator.aadhar(),
            drivingLicense: {
                licenseNumber: TestDataGenerator.drivingLicense(),
                expiryDate: "2030-01-01",
                image: "https://example.com/dl.jpg"
            },
            vehicles: [{
                vehicleNumber: TestDataGenerator.vehicleNumber(),
                type: "Truck",
                capacity: "1000kg"
            }],
            address: {
                street: "456 Supply Lane",
                city: "Bangalore",
                state: "Karnataka",
                zipCode: "560002"
            }
        };

        await registerUser('supplier', supplierData);
        await verifyOtp('supplier');
        await loginUser('supplier');

        // 3. Register Industry
        console.log('\n🏭 Testing Industry Registration...');
        const industryData = {
            industryName: "Test Ayurvedic Ltd",
            phone: TEST_PHONE_NUMBER,
            email: TestDataGenerator.email('industry'),
            gstNumber: TestDataGenerator.gst(),
            panNumber: TestDataGenerator.pan(),
            tradeLicense: {
                licenseNumber: TestDataGenerator.tradeLicense(),
                expiryDate: "2030-01-01",
                image: "https://example.com/tl.jpg"
            },
            address: {
                street: "789 Industry Park",
                city: "Mysore",
                state: "Karnataka",
                zipCode: "570001"
            },
            authorizedPerson: {
                name: "Industry Manager",
                aadharNumber: TestDataGenerator.aadhar(),
                designation: "Manager"
            }
        };

        await registerUser('industry', industryData);
        await verifyOtp('industry');
        await loginUser('industry');

        // 4. Register Consumer
        console.log('\n👤 Testing Consumer Registration...');
        const consumerData = {
            phone: TEST_PHONE_NUMBER,
            name: "Test Consumer",
            email: TestDataGenerator.email('consumer')
        };

        await registerUser('consumer', consumerData);
        await verifyOtp('consumer');
        await loginUser('consumer');

        console.log('\n✅ All tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Test Failed:', error.message);
        process.exit(1);
    }
}

async function registerUser(role, data) {
    try {
        const response = await fetch(`${BASE_URL}/auth/${role}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            // If user already exists, that's fine for testing, we can proceed to login
            if (response.status === 409) {
                console.log(`⚠️  ${role} already registered, proceeding to login...`);
                return result;
            }
            throw new Error(`Registration failed: ${JSON.stringify(result)}`);
        }

        console.log(`✅ ${role} registered successfully`);
        return result;
    } catch (error) {
        throw error;
    }
}

async function verifyOtp(role) {
    try {
        const response = await fetch(`${BASE_URL}/auth/${role}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: TEST_PHONE_NUMBER,
                otp: TEST_OTP,
                role: role
            })
        });

        const result = await response.json();

        if (!response.ok) {
            // If already verified, that's fine
            if (result.message === "User already verified") {
                console.log(`ℹ️  ${role} already verified`);
                return result;
            }
            throw new Error(`OTP Verification failed: ${JSON.stringify(result)}`);
        }

        console.log(`✅ ${role} OTP verified successfully`);
        return result;
    } catch (error) {
        throw error;
    }
}

async function loginUser(role) {
    try {
        // 1. Request Login OTP
        const otpResponse = await fetch(`${BASE_URL}/auth/${role}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: TEST_PHONE_NUMBER })
        });

        const otpResult = await otpResponse.json();

        if (!otpResponse.ok) {
            throw new Error(`Login OTP request failed: ${JSON.stringify(otpResult)}`);
        }

        console.log(`✅ ${role} Login OTP requested`);

        // 2. Verify Login OTP
        const verifyResponse = await fetch(`${BASE_URL}/auth/${role}/verify-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: TEST_PHONE_NUMBER,
                otp: TEST_OTP
            })
        });

        const verifyResult = await verifyResponse.json();

        if (!verifyResponse.ok) {
            throw new Error(`Login verification failed: ${JSON.stringify(verifyResult)}`);
        }

        console.log(`✅ ${role} Logged in successfully`);
        return verifyResult;
    } catch (error) {
        throw error;
    }
}

runTest();
