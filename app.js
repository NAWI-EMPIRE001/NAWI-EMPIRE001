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

const rateLimiter = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

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
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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

app.use(rateLimiter);

// ======================================================
// STATIC FILES
// ======================================================

app.use(
    '/uploads',
    express.static(path.join(__dirname, 'uploads'))
);

app.use(
    express.static(path.join(__dirname, 'public'))
);

// ======================================================
// ROOT HEALTH CHECK
// ======================================================

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ONLINE',
        ecosystem: 'NAWI-EMPIRE001',
        architecture: '7-PILLAR ECOSYSTEM',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// DETAILED HEALTH CHECK
// ======================================================

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        database: 'CONNECTED',
        status: 'HEALTHY',
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ======================================================
// API VERSION 1 ROUTES
// ======================================================

// AUTHENTICATION
app.use('/api/v1/auth', authRoutes);

// USER PROFILE
app.use('/api/v1/profile', profileRoutes);

// WALLET ENGINE
app.use('/api/v1/wallet', walletRoutes);

// ESCROW ENGINE
app.use('/api/v1/escrow', escrowRoutes);

// MARKETPLACE ENGINE
app.use('/api/v1/marketplace', marketplaceRoutes);

// STREAMING ENGINE
app.use('/api/v1/streams', streamRoutes);

// MESSAGING ENGINE
app.use('/api/v1/messages', messageRoutes);

// VERIFICATION ENGINE
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
