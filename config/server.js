// =========================================================
// 👑 NAWI-EMPIRE001 - MASTER SERVER ENTRY POINT
// PRODUCTION CORE ARCHITECTURE & FAULT-TOLERANT BOT SEQUENCE
// =========================================================

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

// Core Framework Dependencies
const app = require('./app');

// Dynamic Database Fallback Loader
let connectDB = null;
try {
    connectDB = require('./config/db');
} catch (err) {
    console.warn('⚠️ ./config/db.js module not detected. Using internal fallback connector.');
}

// WebSocket Module Loader
let initSockets = null;
try {
    initSockets = require('./sockets');
} catch (err) {
    console.warn('⚠️ Socket module not detected. Continuing without WebSockets.');
}

// =========================================================
// ENVIRONMENT CONFIGURATION & PERFECT MONGODB FALLBACK
// =========================================================
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Hardcoded with your verified, perfect connection string as the absolute fallback
const PERFECT_MONGO_URI = "mongodb+srv://nawi-empire001:dK05dKxX5WaY9oud@nawi-empire001.zwidxex.mongodb.net/?appName=NAWI-EMPIRE001";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || PERFECT_MONGO_URI;

// Global instance variable allocation for shutdown access scope
let serverInstance = null;

// =========================================================
// GLOBAL SAFETY EXCEPTION TRAPS (Anti-Crash Interceptors)
// =========================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ UNHANDLED REJECTION DETECTED AT:', promise);
    console.error('REASON:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ CRITICAL UNCAUGHT EXCEPTION OCCURRED:');
    console.error(err);
    emergencyForceShutdown();
});

// =========================================================
// FAULT-TOLERANT DATABASE ENGINE CONNECTOR
// =========================================================
const executeDatabaseConnection = async () => {
    if (typeof connectDB === 'function') {
        try {
            await connectDB();
            return true;
        } catch (err) {
            console.error('❌ External connectDB failed. Forcing internal fallback engine...', err.message);
        }
    }

    const options = {
        autoIndex: NODE_ENV !== 'production', 
        maxPoolSize: 10,                      
        serverSelectionTimeoutMS: 5000,       
        socketTimeoutMS: 45000,               
    };

    // Mongoose connects directly using the verified connection string format
    await mongoose.connect(MONGO_URI, options);
};

// =========================================================
// SYSTEM BOOT SEQUENCE
// =========================================================
const startServer = async () => {
    try {
        console.log(`
====================================================
 NAWI-EMPIRE001 BOOT SEQUENCE STARTING
====================================================
 ENVIRONMENT : ${NODE_ENV.toUpperCase()}
 PORT        : ${PORT}
====================================================
        `);

        // Execute Database Connection with strict fallback safety
        await executeDatabaseConnection();
        console.log('🟢 MongoDB Connected and Synchronized Safely');

        // =================================================
        // HTTP SERVER CORE CREATION
        // =================================================
        serverInstance = http.createServer(app);

        // =================================================
        // SOCKET.IO INITIALIZATION LAYER
        // =================================================
        if (typeof initSockets === 'function') {
            initSockets(serverInstance);
            console.log('🟣 WebSocket Layer Initialized');
        } else {
            console.log('⚪ WebSocket Layer: Bypass Mode Enabled.');
        }

        // =================================================
        // START NETWORK ENGINE LISTENING
        // =================================================
        serverInstance.listen(PORT, '0.0.0.0', () => {
            console.log(`
====================================================
 🚀 NAWI-EMPIRE001 ONLINE
====================================================
 STATUS      : OPERATIONAL
 PORT        : ${PORT}
 ENVIRONMENT : ${NODE_ENV.toUpperCase()}
====================================================
            `);
        });

        // =================================================
        // SERVER NETWORK ERROR HANDLER
        // =================================================
        serverInstance.on('error', (err) => {
            console.error('❌ RUNTIME NETWORK SERVER ERROR:', err.message);
            process.exit(1);
        });

    } catch (err) {
        console.error(`
====================================================
 CRITICAL SERVER START FAILURE
====================================================
 ERROR REASON: ${err.message}
====================================================
        `);
        process.exit(1);
    }
};

// =========================================================
// GRACEFUL ENGINE SHUTDOWN COOLDOWN LAYER
// =========================================================
const shutdown = async (signal) => {
    console.log(`\n====================================================\n ${signal} RECEIVED - TEARING DOWN ECOSYSTEM SAFELY\n====================================================`);

    const forceExitTimeout = setTimeout(() => {
        console.error('⚠️ Graceful shutdown timed out. Forcing transaction node termination.');
        process.exit(1);
    }, 10000);

    if (serverInstance) {
        serverInstance.close(async () => {
            try {
                await mongoose.connection.close();
                console.log('🟢 MongoDB Connection Closed Safely.');
                console.log('🛑 Server Shutdown Complete. Node Released.');
                clearTimeout(forceExitTimeout);
                process.exit(0);
            } catch (dbErr) {
                console.error('Mongo Shutdown Error:', dbErr.message);
                process.exit(1);
            }
        });
    } else {
        clearTimeout(forceExitTimeout);
        process.exit(0);
    }
};

const emergencyForceShutdown = () => {
    try {
        if (serverInstance) serverInstance.close();
        mongoose.connection.close(false, () => {
            process.exit(1);
        });
    } catch (e) {
        process.exit(1);
    }
};

// Register Signal Observers globally
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// =========================================================
// RUN EMPIRE NODE ENGINE
// =========================================================
startServer();
