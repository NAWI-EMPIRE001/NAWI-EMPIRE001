/**
 * NAWI-EMPIRE001 Core Infrastructure
 * models: server.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Permanently frozen enterprise production bootstrap orchestrator.
 * Handles unified environment validation, chronological startup sequences, 
 * safe connection draining pools, listener deduplication, and testing runtime state resets.
 */

// 🛡️ INFRASTRUCTURE AUDIT: Load local configuration variables only when running outside cloud pipelines
if (process.env.NODE_ENV !== "production") {
    try {
        require('dotenv').config();
    } catch (e) {
        console.warn("Orchestration Hub Warning: ⚠️ Optional dotenv module missing in non-production scope.");
    }
}

const http = require('http');
const os = require('os');
const app = require('./app'); // Hardened Express application layer shell
const { connectDB, closeDB, getDatabaseInfo } = require('./config/db');
const { version: PLATFORM_VERSION } = require('./package.json');

// Core network tracking parameters
const PORT = normalizePort(process.env.PORT || 5000);
app.set('port', PORT);

// System server instance and state management variables
let serverInstance = null;
let isShuttingDown = false;
let serverReady = false;
let startedAt = null;

// Telemetry counters for granular administrative tracking
let activeRequestsCount = 0;
const activeConnectionsPool = new Set();

/**
 * Normalizes network port strings into safe numerical boundaries.
 */
function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val; 
    if (port >= 0) return port;  
    return false;
}

/**
 * Validates critical environment runtime definitions prior to infrastructure initialization.
 */
const verifyEnvironmentVariables = () => {
    const requiredSecrets = ['MONGO_URI', 'JWT_SECRET'];
    const missingSecrets = requiredSecrets.filter(secret => !process.env[secret]);

    if (missingSecrets.length > 0) {
        throw new Error(`Bootstrap Configuration Error: Critical system fields are undefined: [${missingSecrets.join(', ')}]`);
    }
};

/**
 * Provides an administrative diagnostic read of current server operational states.
 * @returns {Object} Frozen state snapshot telemetry.
 */
const getServerState = () => {
    return Object.freeze({
        ready: serverReady,
        shuttingDown: isShuttingDown,
        uptimeOrigin: startedAt,
        connections: activeConnectionsPool.size,
        activeRequests: activeRequestsCount,
        processUptime: startedAt ? Math.floor((Date.now() - Date.parse(startedAt)) / 1000) : 0,
        hostNode: os.hostname()
    });
};

/**
 * Direct evaluation helper to check active server availability.
 * @returns {boolean} True if the HTTP listener is ready for traffic
 */
const isServerReady = () => {
    return serverReady;
};

/**
 * Executes a sequential, graceful termination of all active ecosystem operational layers.
 * @param {string} incomingSignal - The system termination event label triggered.
 * @returns {Promise<void>} Resolves when all connections have safely completed.
 */
const initiateGracefulShutdown = async (incomingSignal) => {
    // 🛡️ RECURSION GUARD: Stop cascading execution loop paths during concurrent signal bursts
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    serverReady = false;

    console.warn(`\nOrchestration Hub: 🚨 Received termination signal [${incomingSignal}]. Commencing system drain...`);

    // Enforce a hard 20-second timeout ceiling for total cleanup routines to prevent container deadlocks
    const forceTerminationTimeout = setTimeout(() => {
        console.error('Orchestration Hub: 🚨 Teardown deadline expired. Forcing absolute runtime execution cut.');
        if (require.main === module) {
            process.exit(1);
        }
    }, 20000);

    // Unreference the timer handle to allow clean script exits if operations finish early
    forceTerminationTimeout.unref();

    if (serverInstance) {
        console.log('Orchestration Hub: 🔌 Stopping HTTP server from accepting new paths...');
        
        const serverClosePromise = new Promise((resolve) => serverInstance.close(() => resolve(true)));
        
        let closeTimeoutId = null;
        // 🛡️ TIMEOUT GUARD: Limit server drainage window to 5 seconds to let in-flight work finish gracefully
        const serverCloseTimeoutPromise = new Promise((resolve) => {
            closeTimeoutId = setTimeout(() => resolve(false), 5000);
        });

        try {
            const closedCleanly = await Promise.race([serverClosePromise, serverCloseTimeoutPromise]);
            if (closedCleanly) {
                console.log('Orchestration Hub: 🟢 HTTP server sockets dropped cleanly.');
            } else {
                console.warn('Orchestration Hub Warning: ⚠️ In-flight operations exceeded window. Sweeping remaining sockets...');
            }
        } catch (drainError) {
            console.error('Orchestration Hub: ❌ Socket drainage intercept anomaly:', drainError.message);
        } finally {
            if (closeTimeoutId) {
                clearTimeout(closeTimeoutId);
            }
        }

        // 🛡️ HARD RECYCLER PASS: Force-abort any sticky or idle sockets still holding out after the drainage window
        if (activeConnectionsPool.size > 0) {
            console.log(`Orchestration Hub: ✂️ Force-destroying ${activeConnectionsPool.size} hanging connections...`);
            for (const activeSocket of activeConnectionsPool) {
                if (!activeSocket.destroyed) {
                    activeSocket.destroy();
                }
            }
            activeConnectionsPool.clear();
        }
    }

    try {
        // Trigger centralized database drainage routines cleanly
        await closeDB();
        console.log('Orchestration Hub: 🟢 MongoDB storage structures disconnected neatly.');
        console.log('Orchestration Hub: 🏆 Core system lifecycle successfully wound down.');
    } catch (error) {
        console.error('Orchestration Hub: ❌ Error intercepted during teardown sequence:', error);
        throw error;
    } finally {
        clearTimeout(forceTerminationTimeout);
        // Reset singletons completely to leave a completely pristine testing slate
        serverInstance = null;
        startedAt = null;
        isShuttingDown = false;
    }
};

/**
 * Mounts and executes the core initialization tree for the entire application stack.
 */
const startServer = async () => {
    const startupTimeWatermark = Date.now();
    console.log('Orchestration Hub: ⚡ Initializing NAWI-EMPIRE001 Infrastructure Deployment Matrix...');

    try {
        // 1. Verify environment definitions
        verifyEnvironmentVariables();

        // 2. Initialize database tier via singleton wrapper
        await connectDB();

        // 3. Perform a rigid structural sanity status check on the newly opened driver stream
        const activeDatabaseSnapshot = getDatabaseInfo();
        if (activeDatabaseSnapshot.readyState !== 1) {
            throw new Error('Database Verification Pipeline: Handshake check returned non-operational state identifier.');
        }

        // 4. Bind the Express framework architecture to a native HTTP server context
        serverInstance = http.createServer(app);

        // 5. Hardcode strict enterprise-grade socket processing boundaries 
        serverInstance.requestTimeout = 30000;       // 30 Seconds max query connection execution windows
        serverInstance.headersTimeout = 35000;       // Prevent Slowloris type socket hanging injection attempts
        serverInstance.keepAliveTimeout = 5000;       // Balanced value optimized for Render network container proxies
        serverInstance.maxRequestsPerSocket = 1000;  // Recycles long-lived sockets to eliminate resource accumulation

        // 🛡️ TELEMETRY REQUEST TRACKER: Monitors live query density safely using an idempotent event pass
        serverInstance.on('request', (req, res) => {
            activeRequestsCount++;
            
            let counterDecremented = false;
            const decrementRequestsCounter = () => {
                if (counterDecremented) return;
                counterDecremented = true;
                activeRequestsCount = Math.max(0, activeRequestsCount - 1);
            };

            res.once('finish', decrementRequestsCounter);
            res.once('close', decrementRequestsCounter);
        });

        // 🛡️ DYNAMIC MAP TRACKER: Keep an accurate catalog of connection points for sweeping destructions
        serverInstance.on('connection', (socket) => {
            activeConnectionsPool.add(socket);
            
            socket.on('error', () => {
                activeConnectionsPool.delete(socket);
            });
            
            socket.on('close', () => {
                activeConnectionsPool.delete(socket);
            });
        });

        // 6. Connect diagnostic event listeners to the network server core
        serverInstance.on('error', async (serverError) => {
            if (serverError.syscall !== 'listen') throw serverError;

            const targetBindAddress = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
            switch (serverError.code) {
                case 'EACCES':
                    console.error(`Orchestration Hub: 🚨 Privilege validation error. ${targetBindAddress} demands root credentials.`);
                    try { await initiateGracefulShutdown('EACCES_EXCEPTION'); } finally { process.exit(1); }
                    break;
                case 'EADDRINUSE':
                    console.error(`Orchestration Hub: 🚨 Port conflict intercepted. ${targetBindAddress} is already mapped to an existing process.`);
                    try { await initiateGracefulShutdown('EADDRINUSE_EXCEPTION'); } finally { process.exit(1); }
                    break;
                default:
                    console.error(`Orchestration Hub: ❌ Operational socket exception caught:`, serverError.message);
                    throw serverError;
            }
        });

        // 7. Fire up system listening channels with crisp error rejections
        await new Promise((resolve, reject) => {
            serverInstance.once('error', reject);
            
            serverInstance.listen(PORT, () => {
                serverInstance.off('error', reject); // Detach structural listener immediately upon success
                
                serverReady = true;
                startedAt = new Date().toISOString();
                const architecturalBootDuration = Date.now() - startupTimeWatermark;
                
                console.log('\n======================================================');
                console.log(`🚀 NAWI-EMPIRE001 SYSTEM ENGINE RUNNING DETACHED`);
                console.log('======================================================');
                console.table({
                    PlatformVersion: PLATFORM_VERSION,
                    ProcessID: process.pid,
                    NodeVersion: process.version,
                    Environment: process.env.NODE_ENV || 'production',
                    BoundPort: PORT,
                    MemoryUsage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    ClusterHost: activeDatabaseSnapshot.host,
                    ActiveDatabase: activeDatabaseSnapshot.name,
                    DatabaseLatency: `${activeDatabaseSnapshot.latencyMs}ms`,
                    TotalBootTime: `${architecturalBootDuration}ms`,
                    UptimeOrigin: startedAt,
                    HostNode: os.hostname()
                });
                console.log('Orchestration Hub: 🪐 Standing by for API query requests...\n');
                resolve();
            });
        });

        return serverInstance;
    } catch (bootError) {
        serverReady = false;
        console.error('Orchestration Hub: 🚨 Terminal crash caught during runtime boot sequences:', bootError.message);
        throw bootError; // Bubble error out instead of crashing process to preserve clean integration test workflows
    }
};

// ======================================================
// GLOBAL RUNTIME PROCESS FAULT AND SIGNAL MONITORING
// ======================================================
// 🛡️ LISTENER DEDUPLICATION: Check listener counts before attaching to insulate automated test environments
if (!process.listenerCount('uncaughtException')) {
    process.on('uncaughtException', async (fatalException) => {
        console.error('Orchestration Hub Fatal: 🛑 Uncaught execution exception thrown:', fatalException);
        try {
            await initiateGracefulShutdown('UNCAUGHT_EXCEPTION');
        } finally {
            process.exit(1);
        }
    });
}

if (!process.listenerCount('unhandledRejection')) {
    process.on('unhandledRejection', async (rejectedPromiseReason) => {
        console.error('Orchestration Hub Fatal: 🛑 Unhandled promise rejection state encountered:', rejectedPromiseReason);
        try {
            await initiateGracefulShutdown('UNHANDLED_REJECTION');
        } finally {
            process.exit(1);
        }
    });
}

if (!process.listenerCount('SIGTERM')) {
    process.on('SIGTERM', async () => {
        try { await initiateGracefulShutdown('SIGTERM'); } finally { process.exit(0); }
    });
}

if (!process.listenerCount('SIGINT')) {
    process.on('SIGINT', async () => {
        try { await initiateGracefulShutdown('SIGINT'); } finally { process.exit(0); }
    });
}

// 🛡️ APPLICATION ENTRY GUARD: Only execute boot logic if file is invoked directly by runtime node engines
if (require.main === module) {
    startServer().catch((error) => {
        console.error("Orchestration Hub Fatal: 🚨 Bootstrap execution sequence unraveled:", error.message);
        process.exit(1);
    });
}

module.exports = {
    app,
    startServer,
    getServerState,
    isServerReady,
    initiateGracefulShutdown,
    getServer: () => serverInstance
};
