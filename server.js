// =========================================================
// nawi-OS MASTER SYSTEM ENGINE v7.5 - UNIFIED PRODUCTION BUILD
// SYSTEMS: 7 Pillars, Aurora-231 Handshake, Sovereign P2P Escrow, WebSocket Stream Core
// AUTHORITY WATERMARK: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_nawi-OS001
// =========================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { body, validationResult } = require('express-validator');

// =========================================================
// EXPRESS SERVER INITIALIZATION
// =========================================================
const app = express();
const server = http.createServer(app);

// =========================================================
// ENVIRONMENT VARIABLES
// =========================================================
const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'NAWI_EMPIRE_SECRET';
const NODE_SECRET_KEY = process.env.NODE_SECRET_KEY || 'NAWI_DEFAULT_KEY';
const NODE_ENV = process.env.NODE_ENV || 'production';

const SOVEREIGN_ID = 'nawi-OS001';
const SYSTEM_WATERMARK = 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_nawi-OS-001';
const MONGO_URI = process.env.MONGO_URI;

// =========================================================
// CREATE REQUIRED DIRECTORIES
// =========================================================
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// =========================================================
// SECURITY MIDDLEWARE
// =========================================================
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type', 'Authorization', 'user-id', 'x-node-uuid',
        'x-node-ram', 'x-node-display', 'x-node-signature', 'x-nawi-identity'
    ]
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// RATE LIMITER
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests detected.' }
});
app.use(limiter);

// PLATFORM HEADERS
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'nawi-OS');
    res.setHeader('X-Platform-Authority', SOVEREIGN_ID);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// STATIC ASSETS
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// FILE UPLOAD CONFIGURATION (with filename sanitization)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadsDir); },
    filename: (req, file, cb) => {
        // sanitize original name
        const safeOriginal = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const uniqueName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${safeOriginal}`;
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = [
            'image/jpeg','image/png','image/webp','image/gif',
            'video/mp4','video/quicktime','video/webm','audio/mpeg','audio/mp3'
        ];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(new Error('Unsupported file type'));
    }
});

// =========================================================
// DATABASE SCHEMAS & UTILITIES
// =========================================================
const UserSchema = new mongoose.Schema({
    userId: { type: String, default: () => crypto.randomUUID(), unique: true },
    username: { type: String, trim: true, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone_number: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    role: { type: String, enum: ['user', 'creator', 'admin', 'founder'], default: 'user' },
    current_tier: { type: Number, enum: [1, 2, 3], default: 1 },
    identity: {
        sovereign_name: { type: String, default: 'Authenticated Citizen' },
        legacy_rank: { type: String, default: 'Citizen' },
        id_verified: { type: Boolean, default: false }
    },
    verification_metrics: {
        day_1_video_url: { type: String, default: '' },
        corporate_docs_submitted: { type: Boolean, default: false },
        businessName: { type: String, default: '' },
        cacNumber: { type: String, default: '' }
    },
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 }
    },
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0 }
    },
    backupCodes: [{
        codeHash: String,
        createdAt: { type: Date, default: Date.now },
        used: { type: Boolean, default: false }
    }]
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    creator_id: { type: String, required: true },
    pillar_tool: {
        type: String,
        enum: ['GENERAL', 'THE_SOVEREIGN_EXCHANGE', 'THE_VISIBILITY_ENGINE', 'THE_ARENA_NODE', 'THE_CULINARY_MATRIX', 'THE_AESTHETIC_NEXUS', 'THE_DIAMONDBACK_FORGE', 'THE_SONIC_LEDGER'],
        default: 'GENERAL'
    },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pricing: {
        base_price: { type: Number, default: 0 },
        transaction_type: { type: String, default: 'P2P_ESCROW' }
    },
    apparel_metadata: {
        canvas_json_data: { type: String, default: "" },
        framework_version: { type: String, default: "DIAMONDBACK-231-V1" }
    },
    ads_manager_metadata: {
        boost_enabled: { type: Boolean, default: false },
        target_impressions: { type: Number, default: 0 }
    },
    music_metadata: {
        total_device_downloads: { type: Number, default: 0 },
        artist_name: { type: String, default: "NAWI Artist" }
    },
    media_assets: [{
        asset_id: String,
        file_url: String,
        file_type: String
    }],
    status: { type: String, enum: ['active', 'draft', 'sold'], default: 'active' }
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    authorId: { type: String, required: true },
    authorName: { type: String, default: '' },
    caption: String,
    mediaUrl: String,
    mediaType: { type: String, enum: ['image', 'video', 'audio', 'live_stream'], default: 'image' },
    pillarType: { type: String, enum: ['Comedy', 'Arena', 'Music', 'Kitchen', 'Apparel', 'Normal'], default: 'Normal' },
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    live_stream_metadata: {
        room_id: String,
        is_live_now: { type: Boolean, default: false },
        current_viewers: { type: Number, default: 0 }
    }
}, { timestamps: true });

const DailyLedgerSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    totalVolumeProcessedUsd: { type: Number, default: 0 },
    maxLimitCapUsd: { type: Number, default: 35000000 }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const DailyLedger = mongoose.models.DailyLedger || mongoose.model('DailyLedger', DailyLedgerSchema);

// =========================================================
// ADAPTIVE CONTROLLER MODULE MATRIX LOADERS
// =========================================================
const safeLoad = (primaryPath, fallbackPath, rootFallbackPath, moduleName) => {
    try { return require(primaryPath); } catch (e) {
        if (fallbackPath) { try { return require(fallbackPath); } catch (err) {} }
        if (rootFallbackPath) { try { return require(rootFallbackPath); } catch (rootErr) {} }
        return null;
    }
};

let authController = safeLoad('./controllers/authController', './controllers/authcontroller', './authController', 'authController') || {
    registerUser: async (req, res) => {
        try {
            const { username, email, password, phone_number } = req.body;
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) return res.status(400).json({ success: false, message: 'User already exists.' });

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await User.create({ username, email, password: hashedPassword, phone_number });
            const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(201).json({ success: true, token, user });
        } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
    },
    handleUserSession: async (req, res) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid credentials.' });

            const token = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
            return res.status(200).json({ success: true, token, user });
        } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
    }
};

// =========================================================
// SECURITY ACCESS CONTROL MIDDLEWARES
// =========================================================
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.headers['x-access-token']) {
            token = req.headers['x-access-token'];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Authentication token missing.' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid secure token identity.' });
        req.user = user;
        next();
    } catch (error) { return res.status(401).json({ success: false, message: 'Authentication failed.' }); }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
};

const enforceEcosystemTierSecurity = async (req, res, next) => {
    try {
        const requesterId = req.headers['x-nawi-identity'] || req.headers['user-id'] || req.body.userId || (req.user && req.user.userId);
        if (!requesterId) return res.status(401).json({ success: false, message: 'Missing user identity validation context.' });

        if (requesterId === SOVEREIGN_ID) {
            req.sovereignOverride = true;
            return next();
        }

        const user = await User.findOne({ userId: requesterId });
        if (!user) return res.status(403).json({ success: false, message: 'Access Denied: Signature footprint missing.' });

        req.citizenProfile = user;
        next();
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const AURORA_231_HARDWARE_PROFILE = { 
    expectedUuid: 'AURORA-231-MASTER-NODE-99X-7P', 
    expectedRamGb: 192, 
    expectedDisplaySize: 27 
};

const verifySovereignNodeHandshake = (req, res, next) => {
    const systemUuid = req.headers['x-node-uuid'];
    const systemRam = parseInt(req.headers['x-node-ram'], 10);
    const systemDisplay = parseInt(req.headers['x-node-display'], 10);
    const secureSignature = req.headers['x-node-signature'];

    if (!systemUuid || !systemRam || !systemDisplay || !secureSignature) {
        return res.status(403).json({ status: 'DENIED', message: 'Unauthorized execution context.' });
    }

    const verificationPayload = `${systemUuid}-${systemRam}-${systemDisplay}`;
    const expectedSignature = crypto.createHmac('sha256', NODE_SECRET_KEY).update(verificationPayload).digest('hex');

    const hardwareMatches = systemUuid === AURORA_231_HARDWARE_PROFILE.expectedUuid &&
                             systemRam === AURORA_231_HARDWARE_PROFILE.expectedRamGb &&
                             systemDisplay === AURORA_231_HARDWARE_PROFILE.expectedDisplaySize;

    if (hardwareMatches && secureSignature === expectedSignature) {
        req.isMasterAuthority = true;
        return next();
    }
    return res.status(401).json({ status: 'DENIED', message: 'Hardware handshake verification failed.' });
};

// =========================================================
// P2P LIQUIDITY CAP ENGINE
// =========================================================
class P2PLiquidityManager {
    async verifyAndTrackVolume(amountUsd) {
        const currentDate = new Date().toISOString().split('T')[0];
        let ledger = await DailyLedger.findOne({ date: currentDate });
        if (!ledger) ledger = new DailyLedger({ date: currentDate, totalVolumeProcessedUsd: 0 });

        if (ledger.totalVolumeProcessedUsd + amountUsd > ledger.maxLimitCapUsd) {
            return { allowed: false, currentVolume: ledger.totalVolumeProcessedUsd };
        }
        ledger.totalVolumeProcessedUsd += amountUsd;
        await ledger.save();
        return { allowed: true, currentVolume: ledger.totalVolumeProcessedUsd };
    }

    async createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet) {
        const volumeCheck = await this.verifyAndTrackVolume(amountUsd);
        if (!volumeCheck.allowed) throw new Error('Transaction Blocked: Limit Breached. $35 Million Daily Cap Reached.');
        return { transactionId, escrowStatus: 'PENDING', amountUsd, buyerWallet, sellerWallet, currentDailyPlatformVolume: volumeCheck.currentVolume, timestamp: Date.now() };
    }
}
const LiquidityEngine = new P2PLiquidityManager();

// =========================================================
// VALIDATION HELPERS
// =========================================================
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    next();
};

// =========================================================
// CORE FUNCTIONAL PRODUCTION ENDPOINTS
// =========================================================
app.get('/health', (req, res) => res.status(200).json({ status: "ONLINE", node: "Aurora-231 Main Core Terminal", uptime: process.uptime() }));

app.post('/api/auth/register',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 8 }),
        body('username').notEmpty().trim()
    ],
    validateRequest,
    authController.registerUser
);

app.post('/api/auth/session',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    validateRequest,
    authController.handleUserSession
);

app.post('/api/login',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    validateRequest,
    authController.handleUserSession
);

app.get('/api/v1/profile', authenticateToken, (req, res) => res.status(200).json({ success: true, profile: req.user }));

app.get('/api/feed/home', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 }).limit(20);
        return res.status(200).json({ success: true, emptyState: posts.length === 0, count: posts.length, data: posts });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/v1/posts/create',
    authenticateToken,
    upload.single('media'),
    [
        body('mediaType').optional().isIn(['image','video','audio','live_stream']),
        body('caption').optional().isLength({ max: 500 }),
        body('pillarType').optional().isIn(['Comedy','Arena','Music','Kitchen','Apparel','Normal'])
    ],
    validateRequest,
    async (req, res) => {
        try {
            const mediaUrl = req.file ? `/uploads/${req.file.filename}` : '';
            const post = await Post.create({
                authorId: req.user.userId,
                authorName: req.user.username,
                caption: req.body.caption,
                mediaUrl,
                mediaType: req.body.mediaType || 'image',
                pillarType: req.body.pillarType || 'Normal'
            });
            return res.status(201).json({ success: true, post });
        } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
    }
);

// =========================================================
// THE 7 STRUCTURAL CORE PILLARS ROUTING INTERFACES
// =========================================================
// ... (routes unchanged) ...

// =========================================================
// BIOMETRIC AND ESCROW VALUATION SYSTEMS
// =========================================================
// ... (routes unchanged) ...

// =========================================================
// LEDGER & ADMIN
// =========================================================
// ... (routes unchanged) ...

app.post('/api/admin/bypass', verifySovereignNodeHandshake, (req, res) => {
    return res.status(200).json({ status: 'SYNCHRONIZED', message: 'Welcome Back nawi-OS001. Master Authority Bypass Engaged.' });
});

// =========================================================
// REAL-TIME LOW-LATENCY WEBSOCKET STREAMING CORE
// =========================================================
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.use(async (socket, next) => {
    try {
        // Support token via socket.handshake.auth.token or socket.handshake.query.token
        const token = (socket.handshake && socket.handshake.auth && socket.handshake.auth.token)
            ? socket.handshake.auth.token
            : (socket.handshake && socket.handshake.query && socket.handshake.query.token)
                ? socket.handshake.query.token
                : null;

        if (!token) return next(new Error('Authentication error: token missing'));

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) return next(new Error('Authentication error: invalid token user'));

        socket.user = user;
        return next();
    } catch (err) {
        return next(new Error(`Authentication error: ${err && err.message ? err.message : 'unknown'}`));
    }
});

io.on('connection', (socket) => {
    console.log(`[AURORA-231] Socket linked: ${socket.id} user:${socket.user?.userId || 'unknown'}`);

    // ... socket event handlers unchanged ...
});

// =========================================================
// ACCOUNT RECOVERY: BACKUP CODES (one-time use)
// =========================================================
// ... (unchanged) ...

// =========================================================
// ERROR AND FALLBACK OVERRIDES
// =========================================================
app.use((err, req, res, next) => {
    console.error('Unhandled error middleware:', err && err.message);
    return res.status(500).json({ success: false, message: 'Internal engine pipeline fault.' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// --- Optional feature modules (safe load: won't crash server if missing) ---
try {
  require(path.join(__dirname, 'ads'));
  console.log('Loaded optional module: ads');
} catch (e) {
  console.warn('Optional module not loaded: ads —', e.message);
}

try {
  require(path.join(__dirname, 'master'));
  console.log('Loaded optional module: master');
} catch (e) {
  console.warn('Optional module not loaded: master —', e.message);
}

try {
  require(path.join(__dirname, 'wallet'));
  console.log('Loaded optional module: wallet');
} catch (e) {
  console.warn('Optional module not loaded: wallet —', e.message);
}

try {
  require(path.join(__dirname, 'apparels'));
  console.log('Loaded optional module: apparels');
} catch (e) {
  console.warn('Optional module not loaded: apparels —', e.message);
}

try {
  require(path.join(__dirname, 'admin-actions'));
  console.log('Loaded optional module: admin-actions');
} catch (e) {
  console.warn('Optional module not loaded: admin-actions —', e.message);
}

try {
  require(path.join(__dirname, 'artist-profile'));
  console.log('Loaded optional module: artist-profile');
} catch (e) {
  console.warn('Optional module not loaded: artist-profile —', e.message);
}
// --- End optional modules ---

// =========================================================
// SYSTEM SEED STRATEGY & IGNITION
// =========================================================
const seedEmpire = async () => {
    try {
        const doSeed = (process.env.SEED_FOUNDER || '').toString().toLowerCase() === 'true';
        if (!doSeed) {
            console.log('SEED_FOUNDER not enabled; skipping founder seeding.');
            return;
        }
        const seedEmail = process.env.SEED_FOUNDER_EMAIL;
        const seedPassword = process.env.SEED_FOUNDER_PASSWORD;
        if (!seedEmail || !seedPassword) {
            console.warn('SEED_FOUNDER enabled but SEED_FOUNDER_EMAIL or SEED_FOUNDER_PASSWORD not provided. Skipping seed.');
            return;
        }

        const founderExists = await User.findOne({ email: seedEmail });
        if (!founderExists) {
            const hashedPassword = await bcrypt.hash(seedPassword, 12);
            await User.create({
                userId: SOVEREIGN_ID,
                username: 'founder',
                email: seedEmail,
                password: hashedPassword,
                phone_number: "+00000000000",
                role: 'founder',
                verified: true,
                current_tier: 3,
                identity: { sovereign_name: '7 pillars', legacy_rank: 'Founder', id_verified: true },
                verification_metrics: { day_1_video_url: "", corporate_docs_submitted: true }
            });
            console.log('🛡️ Master System Founder Node Seeded via env variables.');
        } else {
            console.log('Founder already exists; seed skipped.');
        }
    } catch (e) { console.error("Seed execution fault:", e.message); }
};

if (!MONGO_URI) {
    console.error('[CRITICAL]: Execution halted. MONGO_URI configuration missing.');
    process.exit(1);
}

mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
.then(async () => {
    await seedEmpire();
    server.listen(PORT, () => {
        console.log('====================================================');
        console.log(`NAWI-OS ENGINE ONLINE PORT ${PORT}`);
        console.log(`WATERMARK: ${SYSTEM_WATERMARK}`);
        console.log(`NODE_ENV: ${NODE_ENV}`);
        console.log('====================================================');
    });

    server.on('error', (err) => {
        console.error('Server encountered an error:', err && err.message);
        process.exit(1);
    });

    const shutdown = async (signal) => {
        console.info(`Received ${signal}. Closing server and MongoDB connection...`);
        server.close(() => {
            console.info('HTTP server closed.');
            mongoose.connection.close(false, () => {
                console.info('MongoDB connection closed. Exiting process.');
                process.exit(0);
            });
        });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception thrown:', err);
        process.exit(1);
    });
})
.catch((err) => { console.error('Database connection sync failed:', err && err.message); process.exit(1); });
