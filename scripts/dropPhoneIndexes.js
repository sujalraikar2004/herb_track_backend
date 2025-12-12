import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const dropPhoneIndexes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;

        // List of collections to check
        const collections = ['farmers', 'suppliers', 'industries', 'consumers'];

        for (const collectionName of collections) {
            try {
                const collection = db.collection(collectionName);

                // Get all indexes
                const indexes = await collection.indexes();
                console.log(`\n📋 Indexes for ${collectionName}:`, indexes.map(i => i.name));

                // Drop phone_1 index if it exists
                const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
                if (phoneIndex) {
                    await collection.dropIndex('phone_1');
                    console.log(`✅ Dropped phone_1 index from ${collectionName}`);
                } else {
                    console.log(`ℹ️  No phone_1 index found in ${collectionName}`);
                }
            } catch (error) {
                if (error.code === 26) {
                    console.log(`ℹ️  Collection ${collectionName} does not exist`);
                } else {
                    console.error(`❌ Error processing ${collectionName}:`, error.message);
                }
            }
        }

        console.log('\n✅ Index cleanup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

dropPhoneIndexes();
