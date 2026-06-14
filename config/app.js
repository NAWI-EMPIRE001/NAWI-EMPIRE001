const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// ==============================
// ROUTES IMPORTS
// ==============================
const authRoutes = require('./routes/auth.routes');
const postRoutes = require('./routes/post.routes');
const pillarRoutes = require('./routes/pillar.routes');
const financeRoutes = require('./routes/finance.routes');

// ==============================
// EXPRESS APP INIT
// ==============================
const app = express();

// ==============================
// SECURITY + PERFORMANCE LAYER
// ==============================
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false
    })
);

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ==============================
// STATIC FILES (MEDIA + UI)
// ==============================
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// ==============================
// CORE HEALTH CHECK
// ==============================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ONLINE',
        system: 'NAWI-EMPIRE001 CORE ENGINE',
        architecture: '7-PILLAR UNIFIED FRAMEWORK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ==============================
// 7 PILLAR ROUTE MAPPING
// ==============================

/**
 * PILLAR 1: THE SOVEREIGN EXCHANGE
 * Financial + escrow + wallet systems
 */
app.use('/api/pillar/exchange', financeRoutes);

/**
 * PILLAR 2: THE VISIBILITY ENGINE
 * Ads + promotion + reach systems
 */
app.use('/api/pillar/visibility', pillarRoutes);

/**
 * PILLAR 3: THE ARENA NODE
 * Gaming + battle + interactive systems
 */
app.use('/api/pillar/arena', pillarRoutes);

/**
 * PILLAR 4: THE CULINARY MATRIX
 * Food + content logging system
 */
app.use('/api/pillar/culinary', pillarRoutes);

/**
 * PILLAR 5: THE AESTHETIC NEXUS
 * Styling + apparel + creative design tools
 */
app.use('/api/pillar/aesthetic', pillarRoutes);

/**
 * PILLAR 6: THE DIAMONDBACK FORGE
 * Creation engine (products, frameworks, assets)
 */
app.use('/api/pillar/forge', pillarRoutes);

/**
 * PILLAR 7: THE SONIC LEDGER
 * Media + streaming + audio/video tracking
 */
app.use('/api/pillar/ledger', pillarRoutes);

// ==============================
// CORE SYSTEM ROUTES
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// ==============================
// DEFAULT ROOT RESPONSE
// ==============================
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'NAWI-EMPIRE001 ACTIVE',
        system: '7-PILLAR SOVEREIGN ENGINE',
        status: 'OPERATIONAL'
    });
});

// ==============================
// ERROR HANDLING (GLOBAL)
// ==============================
app.use((err, req, res, next) => {
    console.error('APP ERROR:', err.message || err);
    res.status(500).json({
        success: false,
        message: 'Internal Platform Engine Error'
    });
});

// ==============================
// 404 HANDLER
// ==============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found in NAWI-EMPIRE001 system'
    });
});

// ==============================
// EXPORT APP
// ==============================
module.exports = app;