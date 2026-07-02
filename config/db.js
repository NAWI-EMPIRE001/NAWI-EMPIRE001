/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: config/db.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Permanently frozen enterprise database engine using Mongoose.
 * Features asynchronous singleton execution, event loop timer protection, randomized 
 * retry backoff jitter, idempotent cleanup logic, and frozen metric tracking.
 */

const mongoose = require('mongoose');
const { ServerApiVersion } = require('mongodb');

// Immutable system connection state mapping lookup
const CONNECTION_STATES = Object.freeze({
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
});

// Centralized allocation constants and structural arrays
const HANDSHAKE_TIMEOUT_MS = 15000;

const TRANSIENT_ERRORS = Object.freeze([
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
    "MongoServerSelectionError",
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "EHOSTUNREACH",
    "EAI_AGAIN",
    "ENOTFOUND"
]);

// Immutable production option parameters object optimized for Render containers
const CONNECTION_OPTIONS = Object.freeze({
    maxPoolSize: 20,                 // Upper boundary for concurrent execution channels
    minPoolSize: 5,                  // Cold warm sockets maintained for rapid request handling
    maxConnecting: 2,                // Prevents socket connection storms during massive traffic bursts
    serverSelectionTimeoutMS: 10000, // Aborts cluster node search fast during shard migrations
    socketTimeoutMS: 45000,          // Shuts down unoptimized long-running query operations
    connectTimeoutMS: 10000,         // Halts cold database handshakes during network drops
    heartbeatFrequencyMS: 10000,     // Periodically pings nodes to check driver connection health
    family: 4,                       // Explicitly forces IPv4 routing to eliminate local loop delays
    appName: "NAWI-EMPIRE001-CORE",   // Exposes clean metadata markers within MongoDB Atlas graphs
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true      // Signals driver deprecations immediately during early tests
    }
});

// Isolated, single-file module execution tracking states
let listenersRegistered = false;
let connectionPromise = null;
let lastConnectionDuration = 0;

/**
 * Attaches operational system log listeners to the Mongoose connection stream exactly once.
 */
const registerLifecycleListeners = () => {
    if (listenersRegistered) return;
    listenersRegistered = true;

    mongoose.connection.on("connected", () => {
        console.log("Orchestration Hub: 🟢 Database connection stream successfully stabilized.");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Orchestration Hub Exception: ❌ Mongoose connection pool error:", {
            message: err.message,
            database: mongoose.connection.name,
            timestamp: new Date().toISOString()
        });
    });

    mongoose.connection.on("disconnected", () => {
        console.warn("Orchestration Hub Alert: ⚠️ System detached from MongoDB cluster stream path.");
    });

    mongoose.connection.on("reconnected", () => {
        console.log("Orchestration Hub Recovery: 🟢 Database connection successfully re-anchored to cluster.");
    });
};

/**
 * Returns a descriptive string representation of the active Mongoose state.
 * @returns {string} Explicit state label
 */
const getDatabaseState = () => {
    return CONNECTION_STATES[mongoose.connection.readyState] || "unknown";
};

/**
 * Evaluates whether the connection pool is operational.
 * @returns {boolean} True if state is connected
 */
const isDatabaseReady = () => {
    return mongoose.connection.readyState === 1;
};

/**
 * Fetches the duration of the last successful cluster connection sequence.
 * @returns {number} Time in milliseconds
 */
const getConnectionDuration = () => {
    return lastConnectionDuration;
};

/**
 * Aggregates complete connection telemetry into a frozen, immutable object.
 * @returns {Readonly<{state: string, host: (string|null), name: (string|null), port: (number|null), readyState: number, latencyMs: number}>}
 */
const getDatabaseInfo = () => {
    return Object.freeze({
        state: getDatabaseState(),
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
        port: mongoose.connection.port || null,
        readyState: mongoose.connection.readyState,
        latencyMs: lastConnectionDuration
    });
};

/**
 * Establishes a highly resilient connection to the database cluster via a singleton pattern.
 * @param {number} maxRetries - Upper execution boundaries specifying backoff limits.
 * @returns {Promise<Object>} Active, verified Mongoose connection instance.
 */
const connectDB = async (maxRetries = 3) => {
    // 🛡️ REUSE GUARD: Instantly return connection context if already established
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    // 🛡️ SINGLETON GUARD: If connection handshake is active, return the existing thread
    if (connectionPromise) {
        return connectionPromise;
    }

    const dbUri = process.env.MONGO_URI;
    if (!dbUri) {
        throw new Error('Database Infrastructure Exception: Critical MONGO_URI environment declaration is missing.');
    }

    // Set engine defaults before opening communication ports
    mongoose.set("bufferCommands", false); // Fail queries instantly during outages to prevent RAM exhaustion
    mongoose.set("strictQuery", true);
    mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
    mongoose.set("autoCreate", process.env.NODE_ENV !== "production");

    registerLifecycleListeners();

    // Assign connection flow cleanly to the singleton holder
    connectionPromise = (async () => {
        let currentAttempt = 1;

        while (currentAttempt <= maxRetries) {
            let timeoutId = null;

            try {
                const startTime = Date.now();
                
                // 🛡️ TIMEOUT GUARD: Initialize a race tracker to halt hanging connection sequences
                const connectionTimeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error("MongoServerSelectionError: Initial driver handshake timeout exceeded."));
                    }, HANDSHAKE_TIMEOUT_MS);
                });

                await Promise.race([
                    mongoose.connect(dbUri, CONNECTION_OPTIONS),
                    connectionTimeoutPromise
                ]);
                
                lastConnectionDuration = Date.now() - startTime;
                console.log(`Orchestration Hub: 🟢 Database pool mounted in ${lastConnectionDuration}ms.`);
                console.table(getDatabaseInfo());
                
                return mongoose.connection;
            } catch (error) {
                // 🛡️ TRANSIENT FAILURE SCANNER: Verify error against frozen network token rules
                const isTransient = TRANSIENT_ERRORS.some(token => 
                    error.name === token || error.message.includes(token) || (error.code && error.code === token)
                );

                if (!isTransient) {
                    console.error("Orchestration Hub: 🚨 Critical non-transient error intercepted. Terminating backoff loop immediately.");
                    throw error;
                }

                console.error(`Orchestration Hub: ❌ Transient database failure on attempt ${currentAttempt}/${maxRetries}:`, error.message);
                
                if (currentAttempt === maxRetries) {
                    console.error('Orchestration Hub: 🚨 Maximum connection loops breached. Propagating exception context.');
                    throw error; // Yield process control safely up to server.js
                }

                // 🛡️ RETRY JITTER OPTIMIZATION: Compute randomized backoff offset to prevent thundering herd spikes
                const randomJitter = Math.floor(Math.random() * 500);
                const backoffTime = (Math.pow(2, currentAttempt) * 1000) + randomJitter;
                console.warn(`Orchestration Hub: ⏳ Re-attempting cluster discovery channel in ${backoffTime / 1000} seconds (including ${randomJitter}ms jitter)...`);
                
                await new Promise((resolve) => setTimeout(resolve, backoffTime));
                currentAttempt++;
            } finally {
                // 🛡️ EVENT LOOP CLEANUP: Clear timeout handle cleanly to release memory slots immediately
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            }
        }
    })();

    try {
        return await connectionPromise;
    } finally {
        // 🛡 *UNIVERSAL RESYNC GUARD: Relinquish promise handler context on completion
        connectionPromise = null;
    }
};

/**
 * Gracefully flushes and closes the database connection pool.
 * Centralizes lifecycle management and cleans module states for subsequent initializations.
 * @returns {Promise<void>}
 */
const closeDB = async () => {
    // 🛡️ IDEMPOTENCY GUARD: Terminate early without running execution operations if already detached
    if (mongoose.connection.readyState === 0) {
        connectionPromise = null;
        return;
    }

    console.warn("Orchestration Hub: 🔌 Initiating safe closure of Mongoose database connections...");
    try {
        await mongoose.connection.close(false);
        console.log("Orchestration Hub: 🟢 Database connection pool gracefully dissolved.");
    } finally {
        connectionPromise = null;
    }
};

module.exports = {
    connectDB,
    closeDB,
    getDatabaseState,
    isDatabaseReady,
    getConnectionDuration,
    getDatabaseInfo
};
