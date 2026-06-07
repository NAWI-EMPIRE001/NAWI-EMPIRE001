// =========================================================
// NAWI-EMPIRE MASTER SYSTEM ENGINE v7.5 - UNIFIED PRODUCTION BUILD
// SYSTEMS: 7 Pillars, Aurora-231 Handshake, Sovereign P2P Escrow, WebSocket Stream Core
// AUTHORITY WATERMARK: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
// Real Platform Framework optimized for verified human interactions.
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
// EXPLICIT MODULE COUPLING LAYER (MATCHING YOUR REPO LAYOUT)
// =========================================================
const authController = require('./controllers/authController.js');
const battleController = require('./controllers/battleController.js');
const borderControl = require('./controllers/borderControl.js');
const masterPayout = require('./controllers/masterPayout.js');
const p2pGateway = require('./controllers/p2pGateway.js');

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

