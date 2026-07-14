/**
 * ==========================================================
 * NAWI-EMPIRE001 Core Infrastructure
 * FILE: server.js
 * SYSTEM AUTHORITY:
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 ecosystem the city of multipillars that produce all what I need and The 7 Core Architectural Pillars.
 * ==========================================================
 */

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const http = require("http");
const crypto = require("crypto");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const app = require("./app");
const { connectDB, closeDB, getDatabaseState, isDatabaseReady } = require("./config/db");

// ======================================================
// INTERNAL STATE
// ======================================================
let serverInstance = null;
let serverReady = false;
let shuttingDown = false;
let activeRequests = 0;
const STARTED_AT = new Date().toISOString();
const sockets = new Set();

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
// EXPRESS CONFIG
// ======================================================
const PORT = Number(process.env.PORT) || 10000;
app.set("port", PORT);
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ======================================================
// SHUTDOWN ROUTING GUARD & HEADERS
// ======================================================
app.use((req, res, next) => {
    if (shuttingDown) {
        return res.status(503).json({ error: "Server shutting down", code: "SERVICE_UNAVAILABLE" });
    }
    res.setHeader("X-Service", "NAWI-EMPIRE001");
    res.setHeader("X-Environment", process.env.NODE_ENV || "development");
    next();
});

// ======================================================
// REQUEST CORRELATION ID & LOGGING
// ======================================================
app.use((req, res, next) => {
    req.requestId = crypto.randomUUID?.() || crypto.randomBytes(16).toString("hex");
    res.setHeader("X-Request-ID", req.requestId);
    next();
});

app.use((req, res, next) => {
    const start = Date.now();
    logger.info("Incoming request", { 
        requestId: req.requestId, 
        method: req.method, 
        path: req.originalUrl 
    });
    
    res.on("finish", () => {
        logger.info("Request completed", {
            requestId: req.requestId,
            status: res.statusCode,
            durationMs: Date.now() - start
        });
    });
    next();
});

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(origin => origin.trim())
    : [];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            logger.warn("Blocked CORS request", { origin });
            return callback(new Error("Origin not allowed"));
        },
        credentials: true
    })
);

// ======================================================
// RATE LIMITER
// ======================================================
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 300,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: "Network capacity reached. Please hold and try again later." }
    })
);

// ======================================================
// PROBES
// ======================================================
app.get("/live", (_, res) => {
    res.sendStatus(200);
});

app.get("/ready", (_, res) => {
    if (shuttingDown) {
        return res.status(503).json({ ready: false, shuttingDown: true });
    }
    const ready = serverReady && isDatabaseReady();
    if (!ready) {
        return res.status(503).json({ ready: false, shuttingDown: false });
    }
    return res.status(200).json({ ready: true, shuttingDown: false });
});

app.get("/health", (_, res) => {
    res.status(200).json({
        status: serverReady ? "healthy" : "starting",
        ready: serverReady,
        shuttingDown,
        uptime: process.uptime(),
        startedAt: STARTED_AT,
        activeRequests,
        database: getDatabaseState(),
        memory: process.memoryUsage(),
        pid: process.pid,
        node: process.version,
        platform: process.platform,
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// 404 CATCH-ALL (Must be before Error Middleware)
// ======================================================
app.use((req, res, next) => {
    res.status(404).json({
        error: "Not Found",
        message: `The endpoint ${req.method} ${req.originalUrl} does not exist on this platform.`,
        requestId: req.requestId
    });
});

// ======================================================
// GLOBAL ERROR MIDDLEWARE (Must be last)
// ======================================================
app.use((err, req, res, next) => {
    logger.error("Unhandled request error", {
        requestId: req.requestId,
        error: err.message,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
    
    if (res.headersSent) {
        return next(err);
    }
    
    res.status(err.status || 500).json({ 
        error: "Internal Server Error", 
        requestId: req.requestId 
    });
});

// ======================================================
// ENVIRONMENT VALIDATION
// ======================================================
function verifyEnvironment() {
    if (process.env.NODE_ENV !== "production") {
        return;
    }
    const required = ["JWT_SECRET", "NODE_SECRET_KEY", "CLIENT_URL"];
    const missing = required.filter(key => !process.env[key]);
    
    if (!process.env.MONGO_URI && !process.env.MONGODB_URI) {
        missing.push("MONGO_URI or MONGODB_URI");
    }
    
    if (missing.length) {
        throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }
}

// ======================================================
// START SERVER
// ======================================================
async function startServer() {
    let startupTimeout;
    try {
        verifyEnvironment();

        startupTimeout = setTimeout(() => {
            logger.error("Startup timeout exceeded (30s). Forcing process exit.");
            process.exit(1);
        }, 30000);

        logger.info("Boot information", {
            node: process.version,
            pid: process.pid,
            platform: process.platform,
            memory: process.memoryUsage().rss
        });

        await connectDB();
        clearTimeout(startupTimeout);

        serverInstance = http.createServer(app);

        // HTTP timeout configuration (Tuned for Load Balancer Compatibility)
        serverInstance.requestTimeout = 30000;
        serverInstance.keepAliveTimeout = 61000; 
        serverInstance.headersTimeout = 65000;  
        serverInstance.maxRequestsPerSocket = 1000;

        // Track sockets
        serverInstance.on("connection", socket => {
            sockets.add(socket);
            socket.on("close", () => {
                sockets.delete(socket);
            });
        });

        // Track requests
        serverInstance.on("request", (req, res) => {
            activeRequests++;
            let completed = false;
            const decrement = () => {
                if (completed) return;
                completed = true;
                activeRequests = Math.max(0, activeRequests - 1);
            };
            res.once("finish", decrement);
            res.once("close", decrement);
        });

        serverInstance.on("error", error => {
            logger.error("HTTP server error", { code: error.code, error: error.message });
            process.exit(1);
        });

        await new Promise((resolve, reject) => {
            serverInstance.once("error", reject);
            serverInstance.listen(PORT, () => {
                serverInstance.off("error", reject);
                serverReady = true;
                logger.info("Server started", { 
                    port: PORT, 
                    environment: process.env.NODE_ENV || "development", 
                    node: process.version 
                });
                resolve();
            });
        });

        return serverInstance;
    } catch (error) {
        if (startupTimeout) clearTimeout(startupTimeout);
        logger.error("Startup failed", { error: error.message });
        process.exit(1);
    }
}

// ======================================================
// GRACEFUL SHUTDOWN
// ======================================================
async function gracefulShutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    serverReady = false;
    
    logger.warn(`Received ${signal}. Starting shutdown sequence.`);
    
    const forceExit = setTimeout(() => {
        logger.error("Shutdown timeout exceeded. Forcing process exit.");
        process.exit(1);
    }, 10000);
    forceExit.unref();

    try {
        if (serverInstance) {
            if (serverInstance.closeIdleConnections) {
                serverInstance.closeIdleConnections();
            }

            await Promise.race([
                new Promise(resolve => serverInstance.close(resolve)),
                new Promise(resolve => setTimeout(resolve, 5000))
            ]);

            if (serverInstance.closeAllConnections) {
                serverInstance.closeAllConnections();
            }
        }
        
        if (sockets.size > 0) {
            logger.warn(`Destroying ${sockets.size} remaining sockets manually`);
            for (const socket of sockets) {
                if (!socket.destroyed) {
                    socket.destroy();
                }
            }
            sockets.clear();
        }
        
        await closeDB();
        logger.info("Shutdown complete");
        process.exit(0);
    } catch (error) {
        logger.error("Shutdown failure", { error: error.message });
        process.exit(1);
    }
}

// ======================================================
// PROCESS EVENTS (Idempotent)
// ======================================================
if (!process.listenerCount("SIGINT")) {
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

if (!process.listenerCount("SIGTERM")) {
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

if (!process.listenerCount("SIGQUIT")) {
    process.on("SIGQUIT", () => gracefulShutdown("SIGQUIT"));
}

if (!process.listenerCount("uncaughtExceptionMonitor")) {
    process.on("uncaughtExceptionMonitor", err => {
        logger.error("Fatal exception observed before handling", { error: err.message });
    });
}

if (!process.listenerCount("uncaughtException")) {
    process.on("uncaughtException", error => {
        logger.error("Uncaught exception", { error: error.message });
        gracefulShutdown("UNCAUGHT_EXCEPTION");
    });
}

if (!process.listenerCount("unhandledRejection")) {
    process.on("unhandledRejection", reason => {
        logger.error("Unhandled rejection", { reason });
        gracefulShutdown("UNHANDLED_REJECTION");
    });
}

// ======================================================
// BOOTSTRAP
// ======================================================
if (require.main === module) {
    startServer();
}

module.exports = {
    app,
    startServer,
    gracefulShutdown,
    isServerReady: () => serverReady,
    getServer: () => serverInstance
};
