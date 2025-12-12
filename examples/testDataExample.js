/**
 * Example script showing how to use TestDataGenerator for testing
 * This demonstrates generating test data for all user types using the same phone number
 */

import { TestDataGenerator } from './utils/testDataGenerator.js';

console.log('='.repeat(80));
console.log('📋 TEST DATA GENERATOR - EXAMPLE USAGE');
console.log('='.repeat(80));
console.log('\n✅ Using the same phone number: 9999999999 for all user types\n');

// FARMER TEST DATA
console.log('👨‍🌾 FARMER TEST DATA:');
console.log('-'.repeat(80));
const farmerData = {
    name: "Ravi Kumar",
    phone: "9999999999",
    dateOfBirth: "1990-01-01",
    aadharNumber: TestDataGenerator.aadhar(),
    profileImage: "https://example.com/farmer-profile.jpg",
    aadharCardImage: "https://example.com/farmer-aadhar.jpg",
    farmerCertificate: "https://example.com/farmer-cert.jpg",
    address: {
        village: "Kanakapura",
        taluk: "Kanakapura",
        district: "Ramanagara",
        state: "Karnataka",
        pincode: "562117"
    },
    farmSize: 5,
    cropsGrown: ["Ashwagandha", "Tulsi", "Brahmi"]
};
console.log(JSON.stringify(farmerData, null, 2));

// SUPPLIER TEST DATA
console.log('\n\n🚚 SUPPLIER TEST DATA:');
console.log('-'.repeat(80));
const supplierData = {
    name: "Mohan Transport Services",
    phone: "9999999999", // Same phone number!
    dateOfBirth: "1985-05-15",
    aadharNumber: TestDataGenerator.aadhar(), // Different Aadhar
    profileImage: "https://example.com/supplier-profile.jpg",
    aadharCardImage: "https://example.com/supplier-aadhar.jpg",
    drivingLicense: {
        licenseNumber: TestDataGenerator.drivingLicense(),
        licenseImage: "https://example.com/dl.jpg",
        expiryDate: "2028-12-31"
    },
    vehicles: [
        {
            vehicleNumber: TestDataGenerator.vehicleNumber(),
            vehicleType: "truck",
            rcBookImage: "https://example.com/rc-book.jpg"
        }
    ],
    address: {
        street: "MG Road",
        city: "Bangalore",
        district: "Bangalore Urban",
        state: "Karnataka",
        pincode: "560001"
    },
    businessName: "Mohan Logistics Pvt Ltd",
    gstNumber: TestDataGenerator.gst()
};
console.log(JSON.stringify(supplierData, null, 2));

// INDUSTRY TEST DATA
console.log('\n\n🏭 INDUSTRY TEST DATA:');
console.log('-'.repeat(80));
const industryData = {
    industryName: "Himalaya Wellness Company",
    industryType: "ayurvedic",
    yearEstablished: 2010,
    phone: "9999999999", // Same phone number!
    email: TestDataGenerator.email('industry'),
    website: "https://himalayawellness.test",
    authorizedPerson: {
        name: "Dr. Rajesh Sharma",
        designation: "Managing Director",
        phone: "9999999999",
        email: TestDataGenerator.email('authorized'),
        aadharNumber: TestDataGenerator.aadhar(),
        aadharCardImage: "https://example.com/auth-person-aadhar.jpg"
    },
    gstNumber: TestDataGenerator.gst(),
    gstCertificate: "https://example.com/gst-cert.jpg",
    panNumber: TestDataGenerator.pan(),
    panCardImage: "https://example.com/pan-card.jpg",
    tradeLicense: {
        licenseNumber: TestDataGenerator.tradeLicense(),
        licenseImage: "https://example.com/trade-license.jpg",
        issueDate: "2020-01-01",
        expiryDate: "2030-12-31"
    },
    companyLogo: "https://example.com/company-logo.jpg",
    address: {
        buildingName: "Wellness Tower",
        street: "Hosur Road",
        area: "Electronic City",
        city: "Bangalore",
        district: "Bangalore Urban",
        state: "Karnataka",
        pincode: "560100"
    },
    productionCapacity: {
        value: 1000,
        unit: "tons/month"
    },
    employeeCount: 150
};
console.log(JSON.stringify(industryData, null, 2));

// CONSUMER TEST DATA
console.log('\n\n👤 CONSUMER TEST DATA:');
console.log('-'.repeat(80));
const consumerData = {
    phone: "9999999999", // Same phone number!
    name: "Priya Sharma",
    email: TestDataGenerator.email('consumer'),
    profileImage: "https://example.com/consumer-profile.jpg"
};
console.log(JSON.stringify(consumerData, null, 2));

// SUMMARY
console.log('\n\n' + '='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));
console.log('✅ All 4 user types use the same phone number: 9999999999');
console.log('✅ All unique fields have been auto-generated:');
console.log(`   - Farmer Aadhar: ${farmerData.aadharNumber}`);
console.log(`   - Supplier Aadhar: ${supplierData.aadharNumber}`);
console.log(`   - Supplier DL: ${supplierData.drivingLicense.licenseNumber}`);
console.log(`   - Supplier Vehicle: ${supplierData.vehicles[0].vehicleNumber}`);
console.log(`   - Industry Email: ${industryData.email}`);
console.log(`   - Industry GST: ${industryData.gstNumber}`);
console.log(`   - Industry PAN: ${industryData.panNumber}`);
console.log(`   - Industry Trade License: ${industryData.tradeLicense.licenseNumber}`);
console.log(`   - Consumer Email: ${consumerData.email}`);
console.log('\n🎯 You can now register all these users without any duplicate key errors!');
console.log('='.repeat(80));
