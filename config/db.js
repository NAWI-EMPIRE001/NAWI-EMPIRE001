// ======================================================
// NAWI-EMPIRE001 - UNIFIED DATABASE ENGINE
// FILE: config/db.js
// PURPOSE: Single MongoDB Connection Layer
// ======================================================

const mongoose = require('mongoose');

// ======================================================
// CONFIGURATION
// ======================================================

const MONGO_URI =
    process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error(
        '❌ MONGO_URI environment variable is missing.'
    );
}

const mongooseOptions = {
    maxPoolSize: 20,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    autoIndex: process.env.NODE_ENV !== 'production',
    retryWrites: true,
    w: 'majority'
};

// ======================================================
// INTERNAL STATE
// ======================================================

let isConnecting = false;
let retryCount = 0;

const MAX_RETRIES = 5;

// ======================================================
// DATABASE CONNECTOR
// ======================================================

const connectDB = async () => {

    // Already connected
    if (mongoose.connection.readyState === 1) {

        console.log(
            '🟢 MongoDB already connected.'
        );

        return mongoose.connection;
    }

    // Connection currently in progress
    if (isConnecting) {

        console.log(
            '🟡 MongoDB connection already in progress.'
        );

        return;
    }

    isConnecting = true;

    try {

        console.log('🔄 Connecting to MongoDB Atlas...');

        const conn = await mongoose.connect(
            MONGO_URI,
            mongooseOptions
        );

        retryCount = 0;
        isConnecting = false;

        console.log(`
=====================================================
🟢 NAWI-EMPIRE001 DATABASE CONNECTED
=====================================================
HOST      : ${conn.connection.host}
DATABASE  : ${conn.connection.name}
STATUS    : ONLINE
=====================================================
        `);

        return conn;

    } catch (error) {

        isConnecting = false;
        retryCount++;

        console.error(`
=====================================================
🔴 DATABASE CONNECTION FAILED
ATTEMPT : ${retryCount}/${MAX_RETRIES}
=====================================================
${error.message}
=====================================================
        `);

        if (retryCount < MAX_RETRIES) {

            const delay =
                Math.min(retryCount * 5000, 30000);

            console.log(
                `⏳ Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

            return connectDB();
        }

        console.error(`
=====================================================
❌ MAXIMUM DATABASE RETRIES EXCEEDED
APPLICATION SHUTDOWN INITIATED
=====================================================
        `);

        process.exit(1);
    }
};

// ======================================================
// CONNECTION EVENTS
// ======================================================

mongoose.connection.on('connected', () => {

    console.log(
        '🟢 MongoDB Event: Connected'
    );
});

mongoose.connection.on('error', (err) => {

    console.error(
        '🔴 MongoDB Event Error:',
        err.message
    );
});

mongoose.connection.on('disconnected', () => {

    console.warn(
        '🟠 MongoDB Event: Disconnected'
    );
});

mongoose.connection.on('reconnected', () => {

    console.log(
        '🟢 MongoDB Event: Reconnected'
    );
});

// ======================================================
// EXPORT
// ======================================================

module.exports = connectDB;