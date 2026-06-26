// ======================================================
// 👑 NAWI-EMPIRE001 APPLICATION CORE
// FILE: app.js
// ======================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// ======================================================
// EXPRESS APP INITIALIZATION
// ======================================================

const app = express();

// ======================================================
// MIDDLEWARE IMPORTS
// ======================================================

const {
    globalLimiter
} = require('./middlewares/rateLimiter');

const {
    notFound,
    errorHandler
} = require('./middlewares/errorMiddleware');

// ======================================================
// ROUTES IMPORTS
// ======================================================

const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const escrowRoutes = require('./routes/escrowRoutes');
const profileRoutes = require('./routes/profileRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const streamRoutes = require('./routes/streamRoutes');
const messageRoutes = require('./routes/messageRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

// ======================================================
// SECURITY MIDDLEWARE
// ======================================================

app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: '*',
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'user-id',
            'x-node-uuid',
            'x-node-ram',
            'x-node-display',
            'x-node-signature',
            'x-nawi-identity'
        ]
    })
);

// ======================================================
// PERFORMANCE MIDDLEWARE
// ======================================================

app.use(compression());

app.use(
    express.json({
        limit: '50mb'
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: '50mb'
    })
);

app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? 'combined'
            : 'dev'
    )
);

// ======================================================
// GLOBAL RATE LIMITER
// ======================================================

app.use(globalLimiter);

// ======================================================
// STATIC FILES
// ======================================================

app.use(
    '/uploads',
    express.static(
        path.join(__dirname, 'uploads')
    )
);

app.use(
    express.static(
        path.join(__dirname, 'public')
    )
);

// ======================================================
// ROOT ROUTE
// ======================================================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ONLINE',
        ecosystem: 'NAWI-EMPIRE001',
        architecture: '7-PILLAR ECOSYSTEM',
        environment:
            process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// HEALTH CHECK ROUTE
// ======================================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'HEALTHY',
        database: 'CONNECTED',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// API ROUTES
// ======================================================

app.use('/api/v1/auth', authRoutes);

app.use('/api/v1/profile', profileRoutes);

app.use('/api/v1/wallet', walletRoutes);

app.use('/api/v1/escrow', escrowRoutes);

app.use('/api/v1/marketplace', marketplaceRoutes);

app.use('/api/v1/streams', streamRoutes);

app.use('/api/v1/messages', messageRoutes);

app.use('/api/v1/verification', verificationRoutes);

// ======================================================
// 404 HANDLER
// ======================================================

app.use(notFound);

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// EXPORT APPLICATION
// ======================================================

module.exports = app;