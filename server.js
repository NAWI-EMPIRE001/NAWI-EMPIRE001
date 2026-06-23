// =========================================================
// 👑 NAWI-EMPIRE001 - MASTER SERVER ENGINE ENTRY POINT
// System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
// Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
// =========================================================

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');

// =========================================================
// 🏛️ THE 7 CORE ARCHITECTURAL PILLARS MATRIX
// =========================================================
const SEVEN_PILLARS_MANIFEST = {
    1: "ARENA_NODE (Gaming & Interactive Layer)",
    2: "SOVEREIGN_EXCHANGE (Trade & Financial Core)",
    3: "VISIBILITY_ENGINE (Ecosystem Advertising & Compliance)",
    4: "CULINARY_MATRIX (Kitchen & Marketplace Engine)",
    5: "AESTHETIC_NEXUS (Design, Apparel & 3D Plaque Renders)",
    6: "DIAMONDBACK_FORGE (Creative Tools & Project Development)",
    7: "SONIC_LEDGER (Ecosystem Decentralized Audio Log Engine)"
};

// =========================================================
// OPTIONAL WEBSOCKET LAYER AUTOMATION
// =========================================================
let initSockets = null;

try {
    const socketModule = require('./sockets');
    if (typeof socketModule === 'function') {
        initSockets = socketModule;
    } else if (socketModule && typeof socketModule.initSockets === 'function') {
        initSockets = socketModule.initSockets;
    }
} catch (err) {
    console.warn('⚠️ Socket module not detected or incomplete. Running without WebSockets.');
}

// =========================================================
// ENVIRONMENT CONFIGURATION
// =========================================================
const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

let serverInstance = null;

// =========================================================
// ENVIRONMENT VALIDATION
// =========================================================
const validateEnvironment = () => {
    const requiredVariables = [
        'MONGO_URI',
        'JWT_SECRET'
    ];

    const missing = requiredVariables.filter(
        variable => !process.env[variable]
    );

    if (missing.length > 0) {
        console.error(`
====================================================
❌ MISSING ENVIRONMENT VARIABLES DETECTED
====================================================
${missing.join('\n')}
====================================================
        `);
        process.exit(1);
    }
};

// =========================================================
// EMERGENCY SHUTDOWN MATRIX
// =========================================================
const emergencyForceShutdown = async () => {
    try {
        if (serverInstance) {
            serverInstance.close();
        }
        await mongoose.connection.close();
    } catch (error) {
        console.error('Emergency shutdown database error:', error.message);
    }
    process.exit(1);
};

// =========================================================
// GLOBAL PROCESS INFRASTRUCTURE SAFETY
// =========================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ UNHANDLED REJECTION IN RUNTIME:');
    console.error('Promise Context:', promise);
    console.error('Reason / Trace:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ CRITICAL UNCAUGHT EXCEPTION THROWN:');
    console.error(err);
    emergencyForceShutdown();
});

// =========================================================
// SERVER BOOT ENGINE
// =========================================================
const startServer = async () => {
    try {
        validateEnvironment();

        console.log(`
====================================================
🚀 NAWI-EMPIRE001 SYSTEM BOOT SEQUENCE INITIATED
====================================================
ENVIRONMENT : ${NODE_ENV.toUpperCase()}
PORT        : ${PORT}
AUTHORITY   : DIAMONDBACK 231 SECURE GATEWAY
====================================================
        `);

        // Display the 7 Core Pillars Layout in Render logs at bootup
        console.log("🏛️ INITIALIZING FRAMEWORK PILLARS:");
        Object.entries(SEVEN_PILLARS_MANIFEST).forEach(([num, pillar]) => {
            console.log(`   [Pillar ${num}] ➔ ${pillar}`);
        });
        console.log("====================================================\n");

        // Initialize Central Database Pool (Config/db.js manages its own logs cleanly)
        await connectDB();

        // HTTP Server Instantiation
        serverInstance = http.createServer(app);

        // Heavy-Duty Server Optimization Timeouts
        serverInstance.timeout = 120000;
        serverInstance.keepAliveTimeout = 65000;
        serverInstance.headersTimeout = 66000;

        // WebSocket Dynamic Mount Engine Check
        if (typeof initSockets === 'function') {
            initSockets(serverInstance);
            console.log('Orchestration Hub: 🟣 WebSocket Layer Layer Active.');
        } else {
            console.log('Orchestration Hub: ⚪ WebSocket Layer Standby.');
        }

        // Start Network Port Binding
        serverInstance.listen(PORT, '0.0.0.0', () => {
            console.log(`
====================================================
👑 NAWI-EMPIRE001 IS ONLINE & OPERATIONAL
====================================================
THE CITY OF MULTIPILLARS PRODUCES ALL WHAT I NEED
STATUS      : ONLINE
PORT        : ${PORT}
ENVIRONMENT : ${NODE_ENV.toUpperCase()}
====================================================
            `);
        });

        serverInstance.on('error', (err) => {
            console.error('❌ SYSTEM NETWORK SERVER ERROR:', err.message);
            process.exit(1);
        });

    } catch (err) {
        console.error(`
====================================================
❌ SERVER CORE START UP FAILURE
====================================================
${err.message}
====================================================
        `);
        process.exit(1);
    }
};

// =========================================================
// GRACEFUL CONNECTION CLOSURE MATRIX
// =========================================================
const shutdown = async (signal) => {
    console.log(`
====================================================
${signal} SIGNAL TERMINATION RECEIVED
SAFE CLOSURE OF SYSTEM ENGINES INITIATED
====================================================
    `);

    const timeout = setTimeout(() => {
        console.error('⚠️ Shutdown threshold exceeded. Forcing breakdown...');
        process.exit(1);
    }, 10000);

    try {
        if (serverInstance) {
            serverInstance.close(async () => {
                await mongoose.connection.close();
                console.log('🟢 MongoDB Connection Gracefully Disconnected.');
                clearTimeout(timeout);
                process.exit(0);
            });
        } else {
            await mongoose.connection.close();
            clearTimeout(timeout);
            process.exit(0);
        }
    } catch (error) {
        console.error('Shutdown Procedure Error:', error.message);
        process.exit(1);
    }
};

// =========================================================
// PROCESS SIGNAL TRAFFIC CONTROLLERS
// =========================================================
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Initialize Infrastructure
startServer();

module.exports = serverInstance;
