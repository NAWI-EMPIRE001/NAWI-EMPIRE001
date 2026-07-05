/**
 * NAWI-EMPIRE001 Core Infrastructure
 * models:app.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Fully hardened production Express core application engine. 
 * Formatted with strict byte-buffer parser preservation, local loopback CORS rules,
 * anti-cache proxy shields, and explicit cross-origin route intercepts.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { version } = require('./package.json');

// ======================================================
// ECOSYSTEM CORE CONSTANTS CONFIGURATION
// ======================================================
const CONFIG = {
    API_PREFIX: '/api/v1',
    JSON_LIMIT: '2mb',
    COMPRESSION_THRESHOLD: 1024,
    REQUEST_TIMEOUT: 60000
};

// ======================================================
// EXPRESS APP INITIALIZATION & PROXY HARDENING
// ======================================================
const app = express();
app.disable('x-powered-by');
app.disable('etag'); // Pure JSON API optimization; omits unneeded token calculation overhead
app.set('trust proxy', 1);

// ======================================================
// UNIFIED TRACE GENERATOR & TIMEOUT LAYER
// ======================================================
app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    req.setTimeout(CONFIG.REQUEST_TIMEOUT);
    next();
});

// ======================================================
// ROUTE REGISTRATION LOGIC (Unified Imports)
// ======================================================
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const walletRoutes = require('./routes/walletRoutes');
const escrowRoutes = require('./routes/escrowRoutes');
const postRoutes = require('./routes/postRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const streamRoutes = require('./routes/streamRoutes');
const messageRoutes = require('./routes/messageRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const financialRoutes = require('./routes/financialRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// ======================================================
// SECURITY SHIELD ENGINES (HELMET & PRODUCTION CORS)
// ======================================================
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "same-site" }, // Strengthened protection for system uploads
        contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        hsts: process.env.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
    })
);

// Fallback downstream headers to reinforce upstream proxy rules
app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
});

const allowedOrigins = (process.env.CLIENT_URLS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Dynamic evaluation support for development servers (localhost, 127.0.0.1, [::1])
            const isLocalDevelopment = typeof origin === "string" && (
                origin.startsWith("http://localhost:") || 
                origin.startsWith("http://127.0.0.1:") || 
                origin.startsWith("http://[::1]:")
            );

            if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && isLocalDevelopment)) {
                return callback(null, true);
            }
            return callback(new Error('CORS Policy: Access denied for unapproved connection node.'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: [
            'Content-Type', 'Authorization', 'user-id', 'x-node-uuid', 
            'x-node-ram', 'x-node-display', 'x-node-signature', 'x-nawi-identity', 'X-Request-ID'
        ]
    })
);

// ======================================================
// PERFORMANCE & TRACE STREAM LOGGING
// ======================================================
app.use(compression({ threshold: CONFIG.COMPRESSION_THRESHOLD }));

morgan.token('request-id', (req) => req.requestId || 'SYSTEM-INIT');
app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? '[:request-id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" - :response-time ms'
            : '[:request-id] :method :url :status :response-time ms - :res[content-length]'
    )
);

// ======================================================
// STATIC MEDIA ASSET PATHWAYS (RATE LIMIT EXEMPT)
// ======================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '1d' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// ======================================================
// HARDENED DATA BOUNDARY PARSERS (WITH BYTE-BUFFER PRESERVATION)
// ======================================================
app.use(express.json({ 
    limit: CONFIG.JSON_LIMIT, 
    strict: true,
    verify: (req, res, buf) => {
        // Intentionally stored as a raw Buffer to compute untouched HMAC byte-signatures for payment gateways
        req.rawBody = buf; 
    }
}));
app.use(express.urlencoded({ extended: true, limit: CONFIG.JSON_LIMIT }));

// ======================================================
// EXPLICIT ANTI-CACHE HEADERS FOR SENSITIVE API NODES
// ======================================================
app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate, proxy-revalidate');
    next();
});

// ======================================================
// CORE PLATFORM DIAGNOSTICS (LIVENESS vs READINESS)
// ======================================================
app.get('/health', (req, res) => {
    const memory = process.memoryUsage();
    res.status(200).json({
        success: true,
        status: 'HEALTHY',
        pid: process.pid,
        uptime: `${process.uptime().toFixed(2)}s`,
        telemetry: {
            rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
            heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
        },
        version,
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString()
    });
});

app.get('/ready', (req, res) => {
    const MONGODB_STATE_MAP = {
        0: "disconnected", 1: "connected", 2: "connecting", 3: "disconnecting"
    };

    const currentReadyState = mongoose.connection.readyState;
    
    if (currentReadyState !== 1) {
        return res.status(503).json({
            success: false,
            status: 'OUT_OF_SERVICE',
            database: { state: MONGODB_STATE_MAP[currentReadyState] || 'unknown' },
            timestamp: new Date().toISOString()
        });
    }

    res.status(200).json({
        success: true,
        status: 'READY',
        database: {
            state: MONGODB_STATE_MAP[currentReadyState],
            host: mongoose.connection.host,
            name: mongoose.connection.name
        },
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// MASTER ROUTE WEBHOOK & DISTRIBUTION BUS
// ======================================================
app.use(`${CONFIG.API_PREFIX}/payments`, paymentRoutes);
app.use(`${CONFIG.API_PREFIX}/auth`, authRoutes);
app.use(`${CONFIG.API_PREFIX}/profile`, profileRoutes);
app.use(`${CONFIG.API_PREFIX}/wallet`, walletRoutes);
app.use(`${CONFIG.API_PREFIX}/escrow`, escrowRoutes);
app.use(`${CONFIG.API_PREFIX}/posts`, postRoutes);
app.use(`${CONFIG.API_PREFIX}/media`, mediaRoutes);
app.use(`${CONFIG.API_PREFIX}/marketplace`, marketplaceRoutes);
app.use(`${CONFIG.API_PREFIX}/streams`, streamRoutes);
app.use(`${CONFIG.API_PREFIX}/messages`, messageRoutes);
app.use(`${CONFIG.API_PREFIX}/verification`, verificationRoutes);
app.use(`${CONFIG.API_PREFIX}/financial`, financialRoutes);

// ======================================================
// FALLBACK ERROR EXCEPTION CAPTURES
// ======================================================
app.use((req, res, next) => {
    return res.status(404).json({ success: false, message: 'Requested system API architecture node not found.' });
});

app.use((err, req, res, next) => {
    // 🛡️ SECURITY AUDIT: Intercept raw CORS middleware failures to avoid 500 runtime logs leaks
    if (err.message && err.message.startsWith("CORS Policy")) {
        return res.status(403).json({ success: false, message: err.message });
    }

    console.error(`❌ System Exception Trapped [ID: ${req.requestId || 'N/A'}]:`, err);
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(err.statusCode || 500).json({
        success: false,
        message: isProduction 
            ? 'An internal backend transaction error occurred on the platform architecture core.' 
            : err.message || 'Internal Server Error Encountered.'
    });
});

module.exports = app;