// =========================================================
// NAWI-EMPIRE001 - MASTER SERVER ENTRY POINT
// CLEAN PRODUCTION ARCHITECTURE
// =========================================================

require('dotenv').config();

const http = require('http');
const mongoose = require('mongoose');

const app = require('./app');
const connectDB = require('./config/db');

let initSockets = null;

try {
    initSockets = require('./sockets');
} catch (err) {
    console.warn('⚠️ Socket module not detected. Continuing without WebSockets.');
}

// =========================================================
// ENVIRONMENT
// =========================================================

const PORT = process.env.PORT || 10000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// =========================================================
// START SERVER
// =========================================================

const startServer = async () => {
    try {

        console.log(`
====================================================
 NAWI-EMPIRE001 BOOT SEQUENCE STARTING
====================================================
 ENVIRONMENT : ${NODE_ENV}
 PORT        : ${PORT}
====================================================
        `);

        // =================================================
        // DATABASE CONNECTION
        // =================================================

        await connectDB();

        console.log('🟢 MongoDB Connected Successfully');

        // =================================================
        // HTTP SERVER
        // =================================================

        const server = http.createServer(app);

        // =================================================
        // SOCKET.IO INITIALIZATION
        // =================================================

        if (typeof initSockets === 'function') {
            initSockets(server);
            console.log('🟣 WebSocket Layer Initialized');
        }

        // =================================================
        // START LISTENING
        // =================================================

        server.listen(PORT, '0.0.0.0', () => {

            console.log(`
====================================================
 🚀 NAWI-EMPIRE001 ONLINE
====================================================
 STATUS      : OPERATIONAL
 PORT        : ${PORT}
 ENVIRONMENT : ${NODE_ENV}
====================================================
            `);

        });

        // =================================================
        // SERVER ERROR HANDLER
        // =================================================

        server.on('error', (err) => {
            console.error('❌ SERVER ERROR:', err.message);
            process.exit(1);
        });

        // =================================================
        // UNHANDLED REJECTIONS
        // =================================================

        process.on('unhandledRejection', (reason) => {
            console.error('⚠️ UNHANDLED REJECTION');
            console.error(reason);
        });

        // =================================================
        // UNCAUGHT EXCEPTIONS
        // =================================================

        process.on('uncaughtException', (err) => {
            console.error('❌ UNCAUGHT EXCEPTION');
            console.error(err);
            process.exit(1);
        });

        // =================================================
        // GRACEFUL SHUTDOWN
        // =================================================

        const shutdown = async (signal) => {

            console.log(`
====================================================
 ${signal} RECEIVED
 SHUTTING DOWN NAWI-EMPIRE001
====================================================
            `);

            try {

                server.close(async () => {

                    try {

                        await mongoose.connection.close();

                        console.log('🟢 MongoDB Connection Closed');
                        console.log('🛑 Server Shutdown Complete');

                        process.exit(0);

                    } catch (dbErr) {

                        console.error(
                            'Mongo Shutdown Error:',
                            dbErr.message
                        );

                        process.exit(1);
                    }
                });

            } catch (err) {

                console.error(
                    'Shutdown Failure:',
                    err.message
                );

                process.exit(1);
            }
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));

    } catch (err) {

        console.error(`
====================================================
 CRITICAL SERVER START FAILURE
====================================================
 ${err.message}
====================================================
        `);

        process.exit(1);
    }
};

// =========================================================
// BOOT SYSTEM
// =========================================================

startServer();