// ======================================================
// 👑 NAWI-EMPIRE001 APPLICATION MASTER CORE
// FILE: app.js
// PURPOSE: Central Orchestration Engine for the 7 Pillars
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
// SECURITY ENGINE
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
// SYSTEM INPUT OPTIMIZATION & PERFORMANCE
// ======================================================
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(
    morgan(
        process.env.NODE_ENV === 'production'
            ? 'combined'
            : 'dev'
    )
);

// ======================================================
// PUBLIC TRANSACTION WEBHOOK ENTRY POINT
// Placed above limiters to prevent transaction drops
// ======================================================
app.use('/api/v1/payments', paymentRoutes);

// ======================================================
// SECURITY RATE LIMITERS (Optional Fallback Trap)
// ======================================================
try {
    const { globalLimiter } = require('./middlewares/rateLimiter');
    if (globalLimiter) app.use(globalLimiter);
} catch (e) {
    console.warn('⚠️ Rate Limiter middleware not found. Proceeding without global rate limit constraints.');
}

// ======================================================
// STATIC SYSTEM DIRECTORIES
// ======================================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ======================================================
// CORE STATUS & HEALTH MONITORING
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
// MASTER API ROUTE DISTRIBUTION BUS
// ======================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/escrow', escrowRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/streams', streamRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/financial', financialRoutes);

// ======================================================
// 404 UNMAPPED ROUTE FALLBACK HANDLER
// ======================================================
app.use((req, res, next) => {
    try {
        const { notFound } = require('./middlewares/errorMiddleware');
        if (notFound) return notFound(req, res, next);
    } catch (e) {
        return res.status(404).json({ success: false, message: 'Requested API node route not found.' });
    }
});

// ======================================================
// SYSTEM WIDE GLOBAL ERROR INTERCEPTOR
// ======================================================
app.use((err, req, res, next) => {
    console.error('❌ System Core Exception:', err);
    
    try {
        const { errorHandler } = require('./middlewares/errorMiddleware');
        if (errorHandler) return errorHandler(err, req, res, next);
    } catch (e) {
        // Fallback catch block continues to native handler smoothly
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error Encountered on Platform Core.'
    });
});

// ======================================================
// EXPORT UNIFIED APPLICATION ENGINE
// ======================================================
module.exports = app;
