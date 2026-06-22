// =========================================================
// 👑 NAWI-EMPIRE001 - MASTER SERVER ENTRY POINT
// =========================================================

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');

// =========================================================
// OPTIONAL WEBSOCKET LAYER
// =========================================================
let initSockets = null;

try {
    initSockets = require('./sockets');
} catch (err) {
    console.warn(
        '⚠️ Socket module not detected. Running without WebSockets.'
    );
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
❌ MISSING ENVIRONMENT VARIABLES
====================================================
${missing.join('\n')}
====================================================
        `);

        process.exit(1);
    }
};

// =========================================================
// EMERGENCY SHUTDOWN
// =========================================================
const emergencyForceShutdown = async () => {

    try {

        if (serverInstance) {
            serverInstance.close();
        }

        await mongoose.connection.close();

    } catch (error) {
        console.error(
            'Emergency shutdown error:',
            error.message
        );
    }

    process.exit(1);
};

// =========================================================
// GLOBAL PROCESS SAFETY
// =========================================================
process.on('unhandledRejection', (reason, promise) => {

    console.error('⚠️ UNHANDLED REJECTION');
    console.error('Promise:', promise);
    console.error('Reason:', reason);
});

process.on('uncaughtException', (err) => {

    console.error('❌ UNCAUGHT EXCEPTION');
    console.error(err);

    emergencyForceShutdown();
});

// =========================================================
// MONGODB EVENT WATCHERS
// =========================================================
mongoose.connection.on('disconnected', () => {

    console.warn(
        '🟠 MongoDB connection lost.'
    );
});

mongoose.connection.on('reconnected', () => {

    console.log(
        '🟢 MongoDB reconnected.'
    );
});

// =========================================================
// SERVER BOOT ENGINE
// =========================================================
const startServer = async () => {

    try {

        validateEnvironment();

        console.log(`
====================================================
🚀 NAWI-EMPIRE001 BOOT SEQUENCE
====================================================
ENVIRONMENT : ${NODE_ENV.toUpperCase()}
PORT        : ${PORT}
====================================================
        `);

        // Database
        await connectDB();

        console.log(
            '🟢 MongoDB Connected Successfully'
        );

        // HTTP Server
        serverInstance = http.createServer(app);

        // Server Timeouts
        serverInstance.timeout = 120000;
        serverInstance.keepAliveTimeout = 65000;
        serverInstance.headersTimeout = 66000;

        // WebSocket Layer
        if (typeof initSockets === 'function') {

            initSockets(serverInstance);

            console.log(
                '🟣 WebSocket Layer Initialized'
            );

        } else {

            console.log(
                '⚪ WebSocket Layer Disabled'
            );
        }

        // Start Listening
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

        serverInstance.on('error', (err) => {

            console.error(
                '❌ NETWORK SERVER ERROR:',
                err.message
            );

            process.exit(1);
        });

    } catch (err) {

        console.error(`
====================================================
❌ SERVER START FAILURE
====================================================
${err.message}
====================================================
        `);

        process.exit(1);
    }
};

// =========================================================
// GRACEFUL SHUTDOWN
// =========================================================
const shutdown = async (signal) => {

    console.log(`
====================================================
${signal} RECEIVED
SAFE SHUTDOWN INITIATED
====================================================
    `);

    const timeout = setTimeout(() => {

        console.error(
            '⚠️ Shutdown timeout exceeded.'
        );

        process.exit(1);

    }, 10000);

    try {

        if (serverInstance) {

            serverInstance.close(async () => {

                await mongoose.connection.close();

                console.log(
                    '🟢 MongoDB Connection Closed'
                );

                clearTimeout(timeout);

                process.exit(0);
            });

        } else {

            await mongoose.connection.close();

            clearTimeout(timeout);

            process.exit(0);
        }

    } catch (error) {

        console.error(
            'Shutdown Error:',
            error.message
        );

        process.exit(1);
    }
};

// =========================================================
// SIGNAL HANDLERS
// =========================================================
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// =========================================================
// START ECOSYSTEM
// =========================================================
startServer();

// =========================================================
// EXPORTS
// =========================================================
module.exports = serverInstance;
