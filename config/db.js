const mongoose = require('mongoose');

// ==============================
// ENV VALIDATION
// ==============================
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error('❌ MONGO_URI / MONGODB_URI environment variable is missing');
}

// ==============================
// CONNECTION OPTIONS (STABILITY TUNED)
// ==============================
const mongooseOptions = {
    maxPoolSize: 20,              // handles concurrent escrow + streams
    serverSelectionTimeoutMS: 5000, // fail fast on bad connection
    socketTimeoutMS: 45000,
    family: 4,                    // force IPv4 (Render stability)
    autoIndex: true
};

// ==============================
// RETRY SYSTEM
// ==============================
let retryCount = 0;
const MAX_RETRIES = 10;

// ==============================
// CONNECT FUNCTION
// ==============================
const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, mongooseOptions);

        console.log(`
=========================================
 🟢 NAWI-EMPIRE001 DATABASE CONNECTED
=========================================
 HOST: ${mongoose.connection.host}
 DATABASE: ${mongoose.connection.name}
 STATUS: ONLINE
=========================================
        `);

        retryCount = 0; // reset on success

    } catch (error) {

        retryCount++;

        console.error(`
=========================================
 🔴 DATABASE CONNECTION FAILED
 Attempt: ${retryCount}/${MAX_RETRIES}
=========================================
 ${error.message}
=========================================
        `);

        if (retryCount < MAX_RETRIES) {
            const delay = Math.min(1000 * retryCount * 2, 30000);

            console.log(`⏳ Retrying MongoDB in ${delay / 1000}s...`);

            setTimeout(connectDB, delay);
        } else {
            console.error('❌ Max retry limit reached. Shutting down system.');
            process.exit(1);
        }
    }
};

// ==============================
// CONNECTION EVENTS (IMPORTANT)
// ==============================
mongoose.connection.on('connected', () => {
    console.log('🟢 Mongoose event: connected');
});

mongoose.connection.on('error', (err) => {
    console.error('🔴 Mongoose event error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.warn('🟡 Mongoose disconnected — attempting reconnection...');
    connectDB();
});

// ==============================
// GRACEFUL SHUTDOWN SUPPORT
// ==============================
process.on('SIGINT', async () => {
    console.log('⚠️ SIGINT received — closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('⚠️ SIGTERM received — closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = connectDB;