/**
 * ==========================================================
 * NAWI-EMPIRE001 Core Infrastructure
 * FILE: config/db.js
 * SYSTEM AUTHORITY:
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 ecosystem the city of multipillars that produce all what I need and The 7 Core Architectural Pillars.
 * ==========================================================
 */
const mongoose = require("mongoose");
const { ServerApiVersion } = require("mongodb");

// ======================================================
// LOGGER
// ======================================================
const logger = {
    info(message, meta = {}) {
        console.log(JSON.stringify({ level: "INFO", timestamp: new Date().toISOString(), message, ...meta }));
    },
    warn(message, meta = {}) {
        console.warn(JSON.stringify({ level: "WARN", timestamp: new Date().toISOString(), message, ...meta }));
    },
    error(message, meta = {}) {
        console.error(JSON.stringify({ level: "ERROR", timestamp: new Date().toISOString(), message, ...meta }));
    }
};

// ======================================================
// STATE
// ======================================================
let connectionPromise = null;
let connectedAt = null;
let isShuttingDown = false;

const STATES = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
};

const TRANSIENT_ERRORS = new Set([
    "MongoNetworkError",
    "MongoNetworkTimeoutError",
    "MongoServerSelectionError",
    "MongooseServerSelectionError",
    "MongoTopologyClosedError",
    "MongoNotConnectedError",
    "MongoConnectionPoolClearedError"
]);

// ======================================================
// HELPERS
// ======================================================
function getDatabaseState() {
    return STATES[mongoose.connection.readyState] || "unknown";
}

function isDatabaseReady() {
    return mongoose.connection.readyState === 1;
}

function getDatabaseInfo() {
    return {
        state: getDatabaseState(),
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
        port: mongoose.connection.port || null,
        readyState: mongoose.connection.readyState,
        connectedAt,
        uptimeSeconds: connectedAt ? Math.floor((Date.now() - new Date(connectedAt).getTime()) / 1000) : null
    };
}

function getPoolMetrics() {
    return {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        port: mongoose.connection.port
    };
}

// ======================================================
// LISTENERS
// ======================================================
function registerListeners() {
    mongoose.connection.removeAllListeners();

    mongoose.connection.on("connected", () => {
        connectedAt = new Date().toISOString();
        logger.info("MongoDB connected");
    });
    
    mongoose.connection.on("disconnected", () => {
        connectedAt = null;
        logger.warn("MongoDB disconnected");
    });
    
    mongoose.connection.on("reconnected", () => {
        logger.info("MongoDB reconnected");
    });
    
    mongoose.connection.on("error", error => {
        logger.error("MongoDB error", { error: error.message });
    });

    mongoose.connection.on("close", () => {
        logger.info("MongoDB connection permanently closed");
    });
}

// ======================================================
// CONNECT
// ======================================================
async function connectDB(maxRetries = 5) {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    
    if (connectionPromise) {
        return connectionPromise;
    }
    
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MongoDB connection string missing.");
    }
    
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
        throw new Error("Invalid MongoDB URI format");
    }
    
    mongoose.set("strictQuery", true);
    mongoose.set("autoIndex", process.env.NODE_ENV !== "production");
    
    registerListeners();
    isShuttingDown = false;
    
    connectionPromise = (async () => {
        let attempt = 1;
        while (attempt <= maxRetries && !isShuttingDown) {
            try {
                const connection = await mongoose.connect(uri, {
                    maxPoolSize: 50,
                    minPoolSize: 5,
                    serverSelectionTimeoutMS: 10000,
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 15000,
                    heartbeatFrequencyMS: 10000,
                    minHeartbeatFrequencyMS: 1000,
                    compressors: ["zlib"],
                    retryWrites: true,
                    w: "majority",
                    family: 4,
                    serverApi: {
                        version: ServerApiVersion.v1,
                        strict: true,
                        deprecationErrors: true
                    }
                });
                
                logger.info("MongoDB connection established", {
                    host: mongoose.connection.host,
                    database: mongoose.connection.name,
                    attempt
                });
                
                return connection;
            } catch (error) {
                if (isShuttingDown) {
                    logger.warn("MongoDB connection aborted due to shutdown signal.");
                    throw new Error("Connection aborted");
                }

                const isTransient = TRANSIENT_ERRORS.has(error.name);
                
                if (!isTransient) {
                    logger.error("Non-transient MongoDB error", {
                        error: error.message,
                        type: error.name
                    });
                    throw error;
                }
                
                if (attempt >= maxRetries) {
                    logger.error("Maximum MongoDB retries exceeded", {
                        attempts: attempt,
                        error: error.message
                    });
                    throw error;
                }
                
                const jitter = Math.floor(Math.random() * 500);
                const delay = Math.pow(2, attempt) * 1000 + jitter;
                
                logger.warn(`Retrying MongoDB in ${delay}ms`, { attempt });
                
                // Hardened, unref'd sleep implementation
                await new Promise((resolve, reject) => {
                    let timeoutId;
                    const intervalId = setInterval(() => {
                        if (isShuttingDown) {
                            clearInterval(intervalId);
                            clearTimeout(timeoutId);
                            reject(new Error("Retry cancelled by shutdown signal"));
                        }
                    }, 100);
                    intervalId.unref(); // Ensure it doesn't block process exit
                    
                    timeoutId = setTimeout(() => {
                        clearInterval(intervalId);
                        resolve();
                    }, delay);
                    timeoutId.unref(); // Ensure it doesn't block process exit
                }).catch(e => {
                    if (isShuttingDown) return;
                    throw e;
                });
                
                attempt++;
            }
        }
    })();
    
    try {
        return await connectionPromise;
    } finally {
        connectionPromise = null;
    }
}

// ======================================================
// CLOSE
// ======================================================
async function closeDB() {
    isShuttingDown = true;
    if (mongoose.connection.readyState === 0) {
        return;
    }
    logger.warn("Closing MongoDB connection");
    try {
        await mongoose.connection.close(false);
        logger.info("MongoDB connection closed gracefully");
    } finally {
        connectionPromise = null;
    }
}

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    connectDB,
    closeDB,
    getDatabaseState,
    getDatabaseInfo,
    getPoolMetrics,
    isDatabaseReady
};
