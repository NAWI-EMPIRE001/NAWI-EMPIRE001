/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: server.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Fully decoupled, pure network infrastructure bootstrap layer.
 * Isolated against side-effect process actions to guarantee integration-testing safety.
 */

const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';
let serverInstance = null;

// =========================================================
// GLOBAL EXCEPTION SECURITY INTERCEPT ARRAYS
// =========================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ UNHANDLED REJECTION IN RUNTIME ENGINE:', reason);
    // Let global launcher boundary logic capture the structural fault trace
});

process.on('uncaughtException', (err) => {
    console.error('❌ CRITICAL UNCAUGHT EXCEPTION IN METRIC RUNTIME:', err);
    throw err;
});

// =========================================================
// ASYNCHRONOUS EXPLICIT SERVER LAUNCH ENGINE
// =========================================================
const startServer = async () => {
    // Environment Validation via Exceptions
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
        throw new Error("Missing vital configuration tokens: [MONGO_URI, JWT_SECRET] are completely mandatory.");
    }

    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    console.log(`\n🚀 NAWI-EMPIRE001 PLATFORM ENGINE LAYER OPENED`);
    console.log(`----------------------------------------------------`);
    console.log(`PID         : ${process.pid}`);
    console.log(`NODE VER    : ${process.version}`);
    console.log(`ENVIRONMENT : ${NODE_ENV.toUpperCase()}`);
    console.log(`MEMORY INI  : ${memoryUsage} MB`);
    console.log(`TIMEZONE    : ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
    console.log(`----------------------------------------------------\n`);

    // Connect Database Pooled Target
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
        throw new Error("Database validation pass failed. Target data cluster remains unreachable.");
    }

    // Create Base HTTP Server Instantiation
    serverInstance = http.createServer(app);

    // Hardened Timeout Configuration Profiles
    serverInstance.timeout = 60000;
    serverInstance.requestTimeout = 60000; // Aligned with modern Node runtime guidelines
    serverInstance.keepAliveTimeout = 65000;
    serverInstance.headersTimeout = 66000;

    // Optional WebSocket Orchestration Engine Attach
    try {
        const socketModule = require('./sockets');
        const initSockets = typeof socketModule === 'function' ? socketModule : socketModule.initSockets;
        if (typeof initSockets === 'function') {
            const io = initSockets(serverInstance);
            app.set("io", io);
            console.log('Orchestration Hub: 🟣 WebSocket Layer Active.');
        }
    } catch (err) {
        // Safe omission fallback handler
    }

    // Port Binding Promise Framework with Native Error Capturing
    return new Promise((resolve, reject) => {
        serverInstance.once('error', (err) => {
            console.error('❌ SYSTEM NETWORK BINDING EXCEPTION CONFLICT:', err.message);
            reject(err);
        });

        serverInstance.listen(PORT, '0.0.0.0', () => {
            console.log(`\n👑 NAWI-EMPIRE001 SYSTEM ENTRYPOINT ONLINE`);
            console.log(`THE CITY OF MULTIPILLARS PRODUCES ALL WHAT I NEED`);
            console.log(`STATUS      : FUNCTIONAL AND LISTENING ON PORT ${PORT}\n`);
            resolve(serverInstance);
        });
    });
};

// =========================================================
// RE-ENGINEERED GRACEFUL SHUTDOWN SEQUENCING
// =========================================================
const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Gracefully stopping transactional engines...`);

    const forceKillTimeout = setTimeout(() => {
        console.error('⚠️ Graceful resolution limits crossed. Dropping container process.');
        process.exit(1);
    }, 10000);

    try {
        if (serverInstance) {
            await new Promise((resolve) => serverInstance.close(resolve));
            console.log('🟢 HTTP transaction channels disconnected safely.');
        }
        
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('🟢 MongoDB storage structures disconnected neatly.');
        }

        clearTimeout(forceKillTimeout);
        process.exit(0);
    } catch (error) {
        console.error('Error encountered while processing system tear down:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = { app, startServer };
