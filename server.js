// =========================================================
// NAWI-EMPIRE MASTER SYSTEM ENGINE v7.5 - UNIFIED PRODUCTION BUILD
// SYSTEMS: 7 Pillars, Aurora-231 Handshake, Sovereign P2P Escrow, WebSocket Stream Core
// AUTHORITY WATERMARK: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
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

const SOVEREIGN_ID = 'NAWI-EMPIRE001';
const SYSTEM_WATERMARK = 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001';
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
    res.setHeader('X-Powered-By', 'NAWI-EMPIRE');
    res.setHeader('X-Platform-Authority', SOVEREIGN_ID);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
});

// STATIC ASSETS
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadsDir));

// FILE UPLOAD CONFIGURATION
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadsDir); },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${file.originalname}`;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

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
    }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    creator_id: { type: String, required: true }, // Unified to String reference
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
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Authentication token missing.' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ userId: decoded.userId });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid secure token identity.' });
        req.user = user;
        next();
    } catch (error) { return res.status(401).json({ success: false, message: 'Authentication failed.' }); }
};

const enforceEcosystemTierSecurity = async (req, res, next) => {
    try {
        const requesterId = req.headers['x-nawi-identity'] || req.headers['user-id'] || req.body.userId;
        if (!requesterId) return res.status(401).json({ success: false, message: 'Missing user identity validation context.' });

        if (requesterId === SOVEREIGN_ID) {
            req.sovereignOverride = true;
            return next();
        }

        const user = await User.findOne({ userId: requesterId });
        if (!user) return res.status(403).json({ success: false, message: 'Access Denied: Signature footprint missing.' });

        if (!user.verification_metrics?.day_1_video_url) {
            return res.status(403).json({ 
                success: false, 
                required_action: "DAY_1_VIDEO_LOCK_REQUIRED",
                message: "Frictionless Security Gate: Biological signature video file required." 
            });
        }
        req.citizenProfile = user;
        next();
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

const AURORA_231_HARDWARE_PROFILE = { expectedUuid: 'AURORA-231-MASTER-NODE-99X-7P', expectedRamGb: 192, expectedDisplaySize: 27 };

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
// CORE FUNCTIONAL PRODUCTION ENDPOINTS
// =========================================================
app.get('/health', (req, res) => res.status(200).json({ status: "ONLINE", node: "Aurora-231 Main Core Terminal", uptime: process.uptime() }));

app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/session', authController.handleUserSession);
app.post('/api/v1/auth/register', authController.registerUser);
app.post('/api/v1/auth/login', authController.handleUserSession);

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "akpanvictor848@gmail.com" && password === "$Nsikak111") {
        return res.status(200).json({ success: true, userId: SOVEREIGN_ID, rank: "FOUNDER" });
    }
    return res.status(401).json({ success: false, message: "Invalid Credentials." });
});

app.get('/api/v1/profile', authenticateToken, (req, res) => res.status(200).json({ success: true, profile: req.user }));

app.get('/api/feed/home', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 }).limit(20);
        return res.status(200).json({ success: true, emptyState: posts.length === 0, count: posts.length, data: posts });
    } catch (error) { return res.status(500).json({ success: false, error: error.message }); }
});

app.post('/api/v1/posts/create', authenticateToken, upload.single('media'), async (req, res) => {
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
});

// =========================================================
// THE 7 STRUCTURAL CORE PILLARS ROUTING INTERFACES
// =========================================================
app.get('/api/pillar/arena-node', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const games = await Product.find({ pillar_tool: 'THE_ARENA_NODE' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: games });
});

app.get('/api/pillar/sovereign-exchange', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const catalog = await Product.find({ pillar_tool: 'THE_SOVEREIGN_EXCHANGE' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: catalog });
});

app.get('/api/pillar/visibility-engine', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const campaigns = await Product.find({ pillar_tool: 'THE_VISIBILITY_ENGINE', 'ads_manager_metadata.boost_enabled': true });
    return res.status(200).json({ success: true, data: campaigns });
});

app.get('/api/pillar/culinary-matrix', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const logs = await Product.find({ pillar_tool: 'THE_CULINARY_MATRIX' });
    return res.status(200).json({ success: true, data: logs });
});

app.post('/api/culinary/log-file', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const log = await Product.create({ creator_id: req.user.userId, pillar_tool: 'THE_CULINARY_MATRIX', title: req.body.title, description: req.body.description });
    return res.status(201).json({ status: "SUCCESS", asset: log });
});

app.get('/api/pillar/academic-nexus', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const stylings = await Product.find({ pillar_tool: 'THE_AESTHETIC_NEXUS' });
    return res.status(200).json({ success: true, data: stylings });
});

app.post('/api/pillar/diamondback-forge/compile', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    const frameworkAsset = await Product.create({
        creator_id: req.user.userId,
        pillar_tool: 'THE_DIAMONDBACK_FORGE',
        title: req.body.title,
        description: req.body.description,
        pricing: { base_price: req.body.pricingCoins || 0, transaction_type: 'P2P_ESCROW' },
        apparel_metadata: { canvas_json_data: req.body.canvasJsonCoordinates, framework_version: "DIAMONDBACK-231-V1" }
    });
    return res.status(200).json({ success: true, frameworkId: frameworkAsset._id });
});

app.get('/api/pillar/sonic-ledger/download/:assetId', authenticateToken, enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const track = await Product.findOne({ 'media_assets.asset_id': req.params.assetId, pillar_tool: 'THE_SONIC_LEDGER' });
        if (!track) return res.status(404).json({ success: false, message: "Track record missing." });
        track.music_metadata.total_device_downloads += 1;
        await track.save();
        return res.redirect(track.media_assets[0].file_url);
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// =========================================================
// BIOMETRIC AND ESCROW VALUATION SYSTEMS
// =========================================================
app.post('/api/verify/video-lock', upload.single('videoLock'), async (req, res) => {
    try {
        const { userId, email, phone_number } = req.body;
        const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const profile = await User.findOneAndUpdate(
            { userId },
            { email, phone_number, 'verification_metrics.day_1_video_url': fileUrl, current_tier: 1, verified: true, 'identity.id_verified': true },
            { upsert: true, new: true }
        );
        return res.status(200).json({ status: "AUTHENTICATED", profile });
    } catch (e) { return res.status(500).json({ error: e.message }); }
});

app.post('/api/verify/sovereign-challenge', async (req, res) => {
    const { userId, businessName, cacNumber } = req.body;
    const profile = await User.findOneAndUpdate(
        { userId },
        { 'verification_metrics.businessName': businessName, 'verification_metrics.cacNumber': cacNumber, 'verification_metrics.corporate_docs_submitted': true, current_tier: 3 },
        { new: true }
    );
    return res.status(200).json({ status: "SUCCESS", profile });
});

app.post('/api/finance/escrow/create', async (req, res) => {
    try {
        const { transactionId, amountUsd, buyerWallet, sellerWallet } = req.body;
        const escrow = await LiquidityEngine.createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet);
        return res.status(200).json({ status: 'SUCCESS', escrow });
    } catch (error) { return res.status(500).json({ status: 'ERROR', message: error.message }); }
});

app.get('/api/ledger/volume-status', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const ledger = await DailyLedger.findOne({ date: today }) || { totalVolumeProcessedUsd: 0, maxLimitCapUsd: 35000000 };
    return res.status(200).json({ status: 'ACTIVE', date: today, processed: ledger.totalVolumeProcessedUsd, remaining: ledger.maxLimitCapUsd - ledger.totalVolumeProcessedUsd });
});

app.post('/api/admin/bypass', verifySovereignNodeHandshake, (req, res) => {
    return res.status(200).json({ status: 'SYNCHRONIZED', message: 'Welcome Back NAWI-EMPIRE001. Master Authority Bypass Engaged.' });
});

// =========================================================
// REAL-TIME LOW-LATENCY WEBSOCKET STREAMING CORE
// =========================================================
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
    console.log(`[AURORA-231] Socket linked: ${socket.id}`);

    socket.on('start_live_broadcast', async (data) => {
        const { roomId, hostId, hostName, roomTitle } = data;
        socket.join(roomId);
        socket.roomId = roomId;
        socket.hostId = hostId;

        await Post.create({
            authorId: hostId,
            authorName: hostName,
            caption: roomTitle,
            mediaType: 'live_stream',
            pillarType: 'Arena',
            live_stream_metadata: { room_id: roomId, is_live_now: true, current_viewers: 1 }
        });
        io.to(roomId).emit('stream_status_update', { event: "STARTED", roomId, hostId });
    });

    socket.on('join_live_room', async (data) => {
        const { roomId } = data;
        socket.join(roomId);
        socket.roomId = roomId;
        const stream = await Post.findOneAndUpdate({ "live_stream_metadata.room_id": roomId }, { $inc: { "live_stream_metadata.current_viewers": 1 } }, { new: true });
        io.to(roomId).emit('viewer_count_changed', { roomId, currentViewers: stream ? stream.live_stream_metadata.current_viewers : 1 });
    });

    socket.on('stream_frame_broadcast', (data) => {
        socket.to(data.roomId).emit('incoming_stream_frame', data.payload);
    });

    socket.on('disconnect', async () => {
        if (socket.roomId) {
            if (socket.hostId) {
                await Post.updateOne({ "live_stream_metadata.room_id": socket.roomId }, { $set: { "live_stream_metadata.is_live_now": false, status: 'expired' } });
                io.to(socket.roomId).emit('stream_status_update', { event: "ENDED", roomId: socket.roomId });
            } else {
                const stream = await Post.findOneAndUpdate({ "live_stream_metadata.room_id": socket.roomId }, { $inc: { "live_stream_metadata.current_viewers": -1 } }, { new: true });
                io.to(socket.roomId).emit('viewer_count_changed', { roomId: socket.roomId, currentViewers: stream ? stream.live_stream_metadata.current_viewers : 0 });
            }
        }
    });
});

// =========================================================
// ERROR AND FALLBACK OVERRIDES
// =========================================================
app.use((err, req, res, next) => {
    return res.status(500).json({ success: false, message: 'Internal engine pipeline fault.' });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// =========================================================
// SYSTEM SEED STRATEGY & IGNITION
// =========================================================
const seedEmpire = async () => {
    try {
        const founderExists = await User.findOne({ email: 'akpanvictor848@gmail.com' });
        if (!founderExists) {
            const hashedPassword = await bcrypt.hash('$Nsikak111', 12);
            await User.create({
                userId: SOVEREIGN_ID,
                username: 'founder',
                email: 'akpanvictor848@gmail.com',
                password: hashedPassword,
                phone_number: "+2340000000000",
                role: 'founder',
                verified: true,
                current_tier: 3,
                identity: { sovereign_name: '7 pillars', legacy_rank: 'Founder', id_verified: true },
                verification_metrics: { day_1_video_url: "https://cdn.nawi.global/genesis_sig.mp4", corporate_docs_submitted: true }
            });
            console.log('🛡️ Master System Founder Node Account Seeded.');
        }
    } catch (e) { console.error("Seed execution fault:", e.message); }
};

if (!MONGO_URI) {
    console.error('[CRITICAL]: Execution halted. MONGO_URI configuration missing.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
.then(async () => {
    await seedEmpire();
    server.listen(PORT, () => {
        console.log(`====================================================\nNAWI-EMPIRE ENGINE ONLINE PORT ${PORT}\nWATERMARK: ${SYSTEM_WATERMARK}\n====================================================`);
    });
})
.catch((err) => { console.error('Database connection sync failed:', err.message); process.exit(1); });
