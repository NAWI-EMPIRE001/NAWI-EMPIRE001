/**
 * NAWI-EMPIRE MASTER SYSTEM ENGINE v3.8
 * FILE: server.js
 * EDITION: Sovereign Executive Architecture (Unified Production Build)
 * SYSTEMS CONNECTED: Aurora-231 Hardware Check, 7 Pillars Framework,
 * Sovereign P2P Escrow, Real-Time Socket.io Stream Core, Compliance Vault.
 * WATERMARK: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 */

require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const SOVEREIGN_ID = "NAWI-EMPIRE001";
const SYSTEM_WATERMARK = "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001";

// ==========================================
// CASE-SENSITIVE ADAPTIVE CONTROLLER MATRIX
// ==========================================
let authController, battleController, borderControl, masterPayout, p2pGateway;

const safeLoad = (primaryPath, fallbackPath, moduleName) => {
    try {
        return require(primaryPath);
    } catch (e) {
        if (fallbackPath) {
            try {
                return require(fallbackPath);
            } catch (err) {
                console.warn(`⚠️ Warning: ${moduleName} missing at standard and fallback paths. Registering mock layer.`);
                return null;
            }
        }
        console.warn(`⚠️ Warning: ${moduleName} missing. Registering mock layer.`);
        return null;
    }
};

authController = safeLoad('./controllers/authController', './controllers/authcontroller', 'authController') || {
    registerUser: (req, res) => res.status(503).json({ error: "Auth service initializing" }),
    handleUserSession: (req, res) => res.status(503).json({ error: "Auth service initializing" })
};

battleController = safeLoad('./controllers/battle', null, 'battleController') || {
    initializeBattleSession: (req, res) => res.status(503).json({ error: "Battle engine standby" }),
    processStreamVoteGift: (req, res) => res.status(503).json({ error: "Gifting ledger offline" })
};

borderControl = safeLoad('./controllers/border-control', null, 'borderControl') || {
    processIdentityUpload: (req, res) => res.status(503).json({ error: "Verification desk processing" }),
    getVerificationStatus: (req, res) => res.status(503).json({ error: "Verification desk processing" })
};

masterPayout = safeLoad('./controllers/master-payout', null, 'masterPayout') || {
    getPendingWithdrawals: (req, res) => res.status(503).json({ error: "Payout vault in standby" }),
    authorizePayout: (req, res) => res.status(503).json({ error: "Payout vault in standby" })
};

p2pGateway = safeLoad('./controllers/p2p-gateway', null, 'p2pGateway') || {
    serveGatewayPage: (req, res) => res.status(503).send("P2P core system reloading... Please refresh shortly."),
    createP2POrder: (req, res) => res.status(503).json({ error: "P2P network syncing" }),
    confirmP2PRelease: (req, res) => res.status(503).json({ error: "P2P network syncing" }),
    processPillarTransaction: (req, res) => res.status(503).json({ error: "P2P processing offline" }),
    handleDirectFunding: (req, res) => res.status(503).json({ error: "Funding desk syncing" })
};

// ==========================================
// 1. GLOBAL CONFIGURATIONS & ADVANCED MIDDLEWARE
// ==========================================
app.use(helmet({ contentSecurityPolicy: false })); 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
        'Content-Type', 'Authorization', 'user-id', 'x-node-uuid', 
        'x-node-ram', 'x-node-display', 'x-node-signature', 'x-nawi-identity'
    ]
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '/')));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } });

// ==========================================
// 2. UNIFIED DATABASE CONFIGURATION MATRIX (SCHEMAS)
// ==========================================

const UserSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    email: String,
    phone_number: String,
    identity: {
        sovereign_name: { type: String, default: "Authenticated Citizen" },
        legacy_rank: { type: String, default: "Citizen" },
        id_verified: { type: Boolean, default: false },
        joined_date: { type: String, default: () => new Date().toISOString().split('T')[0] }
    },
    verification_metrics: {
        day_1_video_url: { type: String, default: "" }, 
        corporate_docs_submitted: { type: Boolean, default: false },
        platform_age_days: { type: Number, default: 0 }
    },
    current_tier: { type: Number, enum: [1, 2, 3], default: 1 },
    metrics: {
        follower_count: { type: Number, default: 0 },
        following_count: { type: Number, default: 0 },
        daily_streak: { type: Number, default: 0 },
        activity_score: { type: Number, default: 0 }
    },
    eligibility: {
        can_go_live: { type: Boolean, default: false },
        is_monetized: { type: Boolean, default: false },
        gate_1k_reached: { type: Boolean, default: false },
        gate_20k_reached: { type: Boolean, default: false }
    },
    wallet: {
        empire_coins: { type: Number, default: 0 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0.00 },
        last_mint_date: String
    },
    security: {
        is_banned: { type: Boolean, default: false },
        scam_alert_flag: { type: Number, default: 0 },
        multi_factor_auth: { type: String, default: "ENABLED" }
    }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Unified Product Schema supporting all 7 Core Tools & Sovereign Stylist Visual Meta-Data
const ProductSchema = new mongoose.Schema({
    creator_id: { type: String, required: true },
    pillar_tool: { 
        type: String, 
        enum: ['MARKETPLACE_APPAREL', 'ADS_MANAGER', 'GAMING_HUB', 'USER_STREAMS', 'KITCHEN_CANTEEN', 'SOVEREIGN_STYLIST', 'DIAMONDBACK_ASSETS', 'MUSIC_HUB'], 
        required: true 
    },
    title: { type: String, required: true },
    description: String,
    category_feed_target: { type: String, default: 'General' },
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
    stylist_theme: {
        accent_color: { type: String, default: "GOLD" },
        surface_texture: { type: String, default: "OBSIDIAN_TITANIUM" }
    },
    createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const PostSchema = new mongoose.Schema({
    authorName: String,
    authorId: String,
    mediaUrl: String,
    description: String,
    pillarType: { type: String, enum: ['Comedy', 'Arena', 'Music', 'Kitchen', 'Apparel', 'Normal'], default: 'Normal' },
    type: { type: String, enum: ['graphic', 'video', 'audio', 'promotion'], default: 'video' },
    isAd: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    durationWatched: { type: Number, default: 0 }, 
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

const ComplianceVaultSchema = new mongoose.Schema({
    entityName: { type: String, default: 'NAWI-EMPIRE' },
    registeredName: { type: String, default: 'Nsikak Akpan Warri' }, 
    cacRecordNumber: { type: String, required: true },
    msmeRegistrationId: { type: String, required: true },
    encryptionKeySignature: { type: String, required: true }
});
const ComplianceVault = mongoose.models.ComplianceVault || mongoose.model('ComplianceVault', ComplianceVaultSchema);

const DailyLedgerSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    totalVolumeProcessedUsd: { type: Number, default: 0 },
    maxLimitCapUsd: { type: Number, default: 35000000 } 
});
const DailyLedger = mongoose.models.DailyLedger || mongoose.model('DailyLedger', DailyLedgerSchema);

// ========================================================
// 3. THREE-TIER ACTIVITY-BASED ECOSYSTEM SECURITY MIDDLEWARE
// ========================================================
const enforceEcosystemTierSecurity = async (req, res, next) => {
    const requesterId = req.headers['x-nawi-identity'] || req.headers['user-id'] || req.body.userId || req.query.userId;
    
    if (!requesterId) {
        return res.status(401).json({ success: false, message: "Security Warning: Missing citizen access signature token." });
    }

    if (requesterId === SOVEREIGN_ID) {
        req.sovereignOverride = true;
        return next();
    }

    try {
        const user = await User.findOne({ userId: requesterId });
        if (!user) {
            return res.status(403).json({ success: false, message: "Access Denied: Signature footprint not found inside NAWI_DB." });
        }

        // TIER 1 LAW: Mandatory Day 1 Biological Signature Video Lock Checking
        if (!user.verification_metrics?.day_1_video_url) {
            return res.status(403).json({ 
                success: false, 
                required_action: "DAY_1_VIDEO_LOCK_REQUIRED",
                message: "Frictionless Security Gate: Please upload your 10-second biological signature video to activate your account." 
            });
        }

        // TIER 3 LAW: Challenge Form Entry requires absolute corporate documentation validation
        if (req.path.includes('/api/challenge/register') && !user.verification_metrics?.corporate_docs_submitted) {
            return res.status(403).json({
                success: false,
                required_action: "TIER_3_DOCS_REQUIRED",
                message: "Sovereign Challenger Mandate: Official business registration and corporate verification documents are strictly required to clear premium workstation competitions."
            });
        }

        req.citizenProfile = user;
        next();
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// ==========================================
// 4. HARDWARE HANDSHAKE VERIFICATION LAYER
// ==========================================
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
        return res.status(403).json({ 
            status: 'DENIED', 
            message: 'Access Violation: Unauthorized Terminal Context Detected.' 
        });
    }

    const hardwareMatches = (systemUuid === AURORA_231_HARDWARE_PROFILE.expectedUuid) && 
                           (systemRam === AURORA_231_HARDWARE_PROFILE.expectedRamGb) && 
                           (systemDisplay === AURORA_231_HARDWARE_PROFILE.expectedDisplaySize);

    const verificationPayload = `${systemUuid}-${systemRam}-${systemDisplay}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.NODE_SECRET_KEY || 'NAWI_DEFAULT_KEY')
                                    .update(verificationPayload)
                                    .digest('hex');

    if (hardwareMatches && secureSignature === expectedSignature) {
        req.isMasterAuthority = true;
        next();
    } else {
        return res.status(401).json({ 
            status: 'DENIED', 
            message: 'Sovereign Handshake Failed. Terminal Authorization Rejected.' 
        });
    }
};

// ==========================================
// 5. INTEGRATED P2P SCALABILITY ENGINE
// ==========================================
class P2PLiquidityManager {
    constructor() {
        this.binanceApiUrl = 'https://api.binance.com';
        this.bybitApiUrl = 'https://api.bybit.com';
        this.geegpayApiUrl = 'https://api.geegpay.com';
    }

    async verifyAndTrackVolume(amountUsd) {
        const currentDate = new Date().toISOString().split('T')[0];
        let ledger = await DailyLedger.findOne({ date: currentDate });
        
        if (!ledger) {
            ledger = new DailyLedger({ date: currentDate, totalVolumeProcessedUsd: 0 });
        }

        if (ledger.totalVolumeProcessedUsd + amountUsd > ledger.maxLimitCapUsd) {
            return { allowed: false, currentVolume: ledger.totalVolumeProcessedUsd };
        }

        ledger.totalVolumeProcessedUsd += amountUsd;
        await ledger.save();
        return { allowed: true, currentVolume: ledger.totalVolumeProcessedUsd };
    }

    async createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet) {
        const volumeCheck = await this.verifyAndTrackVolume(amountUsd);
        if (!volumeCheck.allowed) {
            throw new Error(`Transaction Blocked: Limit Breached. $35 Million Daily Cap Reached.`);
        }
        return {
            transactionId: transactionId,
            escrowStatus: 'PENDING',
            amountUsd: amountUsd,
            buyer: buyerWallet,
            seller: sellerWallet,
            currentDailyPlatformVolume: volumeCheck.currentVolume,
            timestamp: Date.now()
        };
    }
}
const LiquidityEngine = new P2PLiquidityManager();

// ==========================================
// 6. SEEDING STRATEGY ENGINE
// ==========================================
const seedEmpire = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const templatePath = path.join(__dirname, 'templates', 'user-schema.json');
            if (fs.existsSync(templatePath)) {
                const data = fs.readFileSync(templatePath, 'utf8');
                const template = JSON.parse(data);
                template.userId = "NAWI-EMPIRE001";
                template.email = "akpanvictor848@gmail.com"; 
                const founder = new User(template);
                await founder.save();
                console.log("🏛️ NAWI-EMPIRE001: Genesis Founder Seeded via Template Asset.");
            } else {
                const fallbackFounder = new User({
                    userId: "NAWI-EMPIRE001",
                    email: "akpanvictor848@gmail.com",
                    identity: { sovereign_name: "7 pillars", legacy_rank: "Founder", id_verified: true },
                    verification_metrics: { day_1_video_url: "https://cdn.nawi.global/genesis_sig.mp4", corporate_docs_submitted: true },
                    current_tier: 3,
                    metrics: { follower_count: 50000 },
                    wallet: { empire_coins: 1000000, total_earned_to_date: 50000, pending_conversion: 0 }
                });
                await fallbackFounder.save();
                console.log("🛡️ Fallback Founder Account Seeded Successfully.");
            }
        }
    } catch (err) { console.error("❌ Seed Optimization Error:", err.message); }
};

// ========================================================
// 7. REAL-TIME LIVE DATA MEDIA SYNC SOCKET ENGINE
// ========================================================
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

io.on('connection', (socket) => {
    const connectionTag = socket.handshake.query.userId || "GUEST_CITIZEN";
    console.log(`[AURORA-231 COMPLIANCE] Real-time terminal synchronization initiated for: ${connectionTag}`);

    socket.on('register_stream_node', (data) => {
        socket.join(data.roomChannel);
        console.log(`📡 Stream Node anchored cleanly into room channel: ${data.roomChannel}`);
    });

    socket.on('disconnect', () => {
        console.log(`[AURORA-231] Terminal signature unlinked cleanly.`);
    });
});

// ========================================================
// 8. THE 7 PILLARS INTERACTIVE CLICK-ROUTERS (CLICK AND OPEN)
// ========================================================

/**
 * 🎮 TOOL 1: GLOBAL GAMING VIDEOS LIVE STREAMING BATTLE
 */
app.get('/api/pillar/gaming-hub', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const activeBattles = await Product.find({ pillar_tool: 'GAMING_HUB' }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, tool: "GAMING_HUB", message: "Gaming Hub Open", count: activeBattles.length, data: activeBattles });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 🛍️ TOOL 2: THE GLOBAL MARKETPLACE FOR EVERY ITEM & PRODUCT
 */
app.get('/api/pillar/marketplace', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const products = await Product.find({ pillar_tool: 'MARKETPLACE_APPAREL' }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, tool: "MARKETPLACE", message: "Marketplace Connected", data: products });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 📢 TOOL 3: ADS PROGRAM MANAGER GLOBAL ADVERTISING FOR ALL 7 PILLARS
 */
app.get('/api/pillar/ads-manager', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const targetCampaigns = await Product.find({ pillar_tool: 'ADS_MANAGER', 'ads_manager_metadata.boost_enabled': true });
        return res.status(200).json({ success: true, tool: "ADS_MANAGER", message: "Ads System Open", data: targetCampaigns });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 📱 TOOL 4: REAL VIDEO LIVE STREAMING FOR NEW USERS
 */
app.get('/api/pillar/user-streams', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const liveFeeds = await Product.find({ pillar_tool: 'USER_STREAMS' });
        return res.status(200).json({ success: true, tool: "USER_STREAMS", message: "User Streaming Feeds Online", data: liveFeeds });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 🍳 TOOL 5: KITCHEN MEAL AND REAL VIDEOS LIVE STREAM
 */
app.get('/api/pillar/kitchen-canteen', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const canteenFeeds = await Product.find({ pillar_tool: 'KITCHEN_CANTEEN' });
        return res.status(200).json({ success: true, tool: "KITCHEN_CANTEEN", message: "Artisan Kitchen Coordinates Mounted", data: canteenFeeds });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * ✂️ TOOL 6: SOVEREIGN STYLIST FOR GLOBAL BARBERSHOPS & COSMETICS
 */
app.get('/api/pillar/sovereign-stylist', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const verifiedStylists = await Product.find({ pillar_tool: 'SOVEREIGN_STYLIST' });
        return res.status(200).json({ success: true, tool: "SOVEREIGN_STYLIST", message: "Elite Obsidian-Gold UI Engine Active", data: verifiedStylists });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 🎨 TOOL 7: APPAREL CANVAS STUDIO BY DIAMONDBACK231
 */
app.post('/api/pillar/apparel-studio/save', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const { title, description, canvasJsonCoordinates, pricingCoins, userId } = req.body;
        const graphicFramework = new Product({
            creator_id: userId,
            pillar_tool: 'DIAMONDBACK_ASSETS',
            title: title,
            description: description,
            category_feed_target: 'Marketplace Only',
            pricing: { base_price: pricingCoins, transaction_type: 'P2P_ESCROW' },
            apparel_metadata: { canvas_json_data: canvasJsonCoordinates, framework_version: "DIAMONDBACK-231-V1" }
        });
        await graphicFramework.save();
        return res.status(200).json({ success: true, message: "Design framework compiled and posted to marketplace.", frameworkId: graphicFramework._id });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

/**
 * 🎵 BONUS EXTREME CORE MATRIX: GLOBAL MUSIC HUB & NATIVE DEVICE DOWNLOADER
 */
app.get('/api/pillar/music-hub/download/:assetId', enforceEcosystemTierSecurity, async (req, res) => {
    try {
        const audioAsset = await Product.findOne({ 'media_assets.asset_id': req.params.assetId, pillar_tool: 'MUSIC_HUB' });
        if (!audioAsset) return res.status(404).json({ success: false, message: "Requested audio track record missing." });

        const targetFile = audioAsset.media_assets.find(media => media.asset_id === req.params.assetId);
        audioAsset.music_metadata.total_device_downloads += 1;
        await audioAsset.save();

        res.setHeader('Content-Disposition', `attachment; filename="${audioAsset.title.replace(/\s+/g, '_')}_NAWI_SECURE.mp3"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.redirect(targetFile.file_url);
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// ==========================================
// 9. CORE IDENTITY & SECURITY CHANNELS
// ==========================================
app.post('/api/auth/register', (req, res, next) => authController.registerUser(req, res, next));
app.post('/api/auth/session', (req, res, next) => authController.handleUserSession(req, res, next));

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (email === "akpanvictor848@gmail.com" && password === "$Nsikak111") {
        return res.status(200).json({ success: true, userId: "NAWI-EMPIRE001", rank: "FOUNDER" });
    }
    res.status(401).json({ success: false, message: "Invalid Credentials." });
});

/**
 * MANDATORY REGISTRATION RECOVERY SYSTEM (DUAL-CHANNEL HARD-BOUND)
 */
app.post('/api/auth/recover-keys', async (req, res) => {
    try {
        const { accountIdentity } = req.body;
        const user = await User.findOne({ $or: [{ userId: accountIdentity }, { email: accountIdentity }] });

        if (!user) return res.status(404).json({ success: false, message: "No active profile matches the submitted credentials." });

        const sharedOtpToken = Math.floor(100000 + Math.random() * 900000);
        
        console.log(`[DUAL-CHANNEL CRITICAL OUTBOUND] Synchronizing keys...`);
        console.log(`👉 Channel A [EMAIL] -> Firing OTP Token [${sharedOtpToken}] directly to target: ${user.email}`);
        console.log(`👉 Channel B [MOBILE] -> Firing OTP Token [${sharedOtpToken}] directly to target number: ${user.phone_number}`);

        return res.status(200).json({ 
            success: true, 
            message: "Sovereign Security Handshake: Recovery keys transmitted to both verified communication lines simultaneously. No secondary inputs allowed." 
        });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
});

// TIER 3 COMPETITION TRIGGER ROUTE
app.post('/api/challenge/register', enforceEcosystemTierSecurity, async (req, res) => {
    res.status(200).json({ success: true, message: "Sovereign Challenger cleared for Workstation Competition matching brackets." });
});

// --- PULSE STREAM FEED & ENGAGEMENT PORTS ---
app.get('/api/feed', async (req, res) => {
    try {
        const limit = 12;
        const feedItems = await Post.aggregate([{ $match: { status: 'active' } }, { $sample: { size: limit } }]);
        res.json(feedItems);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/track-engagement', async (req, res) => {
    const { contentId, duration } = req.body;
    try {
        await Post.findByIdAndUpdate(contentId, { $inc: { durationWatched: duration } });
        res.sendStatus(200);
    } catch (err) { res.sendStatus(500); }
});

app.post('/api/battle/initialize', (req, res, next) => battleController.initializeBattleSession(req, res, next));
app.post('/api/battle/vote-gift', (req, res, next) => battleController.processStreamVoteGift(req, res, next));

app.post('/api/border/upload-document', (req, res, next) => borderControl.processIdentityUpload(req, res, next));
app.get('/api/border/verify-status/:userId', (req, res, next) => borderControl.getVerificationStatus(req, res, next));

// --- FINANCIAL VAULTS & P2P LIQUIDITY PORTS ---
app.get('/gateway', p2pGateway.serveGatewayPage);
app.get('/p2p-bridge', (req, res, next) => p2pGateway.serveGatewayPage(req, res, next));
app.post('/api/p2p/create-order', (req, res, next) => p2pGateway.createP2POrder(req, res, next));
app.post('/api/p2p/confirm-release', (req, res, next) => p2pGateway.confirmP2PRelease(req, res, next));
app.post('/api/request-withdrawal', (req, res, next) => p2pGateway.createP2POrder(req, res, next)); 
app.post('/api/p2p/transact', enforceEcosystemTierSecurity, p2pGateway.processPillarTransaction);
app.post('/api/p2p/fund', enforceEcosystemTierSecurity, p2pGateway.handleDirectFunding);

app.post('/api/finance/escrow/create', async (req, res) => {
    try {
        const { transactionId, amountUsd, buyerWallet, sellerWallet } = req.body;
        const escrowResult = await LiquidityEngine.createEscrowTransaction(transactionId, amountUsd, buyerWallet, sellerWallet);
        res.status(200).json({ status: 'SUCCESS', escrow: escrowResult });
    } catch (error) { res.status(500).json({ status: 'ERROR', message: error.message }); }
});

app.get('/api/vault/balance/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ error: "Citizen profile context missing" });
        res.json({ coins: user.wallet.empire_coins, usd: user.wallet.total_earned_to_date, pending: user.wallet.pending_conversion });
    } catch (err) { res.status(500).json({ error: "Vault Link Failed" }); }
});

app.post('/api/convert-coins', async (req, res) => {
    const { userId, amount } = req.body;
    const COIN_VAL = 0.02;
    if (amount < 2500) return res.status(400).json({ message: "Min 2500 Coins required to execute shift." });
    try {
        const user = await User.findOne({ userId });
        if (!user || user.wallet.empire_coins < amount) return res.status(400).json({ message: "Insufficient balance markers." });
        const usdAmount = amount * COIN_VAL;
        await User.updateOne({ userId }, { $inc: { "wallet.empire_coins": -amount, "wallet.pending_conversion": usdAmount } });
        res.json({ success: true, usd: usdAmount });
    } catch (err) { res.status(500).json({ error: "Vault processing context failure." }); }
});

app.get('/api/ledger/volume-status', async (req, res) => {
    try {
        const currentDate = new Date().toISOString().split('T')[0];
        const ledger = await DailyLedger.findOne({ date: currentDate }) || { totalVolumeProcessedUsd: 0, maxLimitCapUsd: 35000000 };
        res.status(200).json({
            status: 'ACTIVE',
            date: currentDate,
            totalVolumeProcessedUsd: ledger.totalVolumeProcessedUsd,
            remainingAllocationUsd: ledger.maxLimitCapUsd - ledger.totalVolumeProcessedUsd,
            hardCapLimitUsd: ledger.maxLimitCapUsd
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMINISTRATIVE & SOVEREIGN BYPASS CHANNELS ---
app.get('/api/master/pending-withdrawals', (req, res, next) => masterPayout.getPendingWithdrawals(req, res, next));
app.post('/api/master/authorize-payout', (req, res, next) => masterPayout.authorizePayout(req, res, next));

app.post('/api/admin/bypass', verifySovereignNodeHandshake, (req, res) => {
    res.status(200).json({
        status: 'SYNCHRONIZED',
        message: 'Welcome Back NAWI-EMPIRE001. Master Authority Bypass Engaged.',
        founderMandate: "This is the CEO's order and authority to protect the founders and this platform. We are not here to collect your money; the only requirement is for everyone to follow the rules of the NAWI-EMPIRE platform."
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ONLINE", node: "Aurora-231 Main Terminal Core", timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// ========================================================
// 10. SYSTEM BINDING & DATABASE INTERFACE REBOOT
// ========================================================
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";
const PORT = process.env.PORT || 10000;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("==========================================================================");
        console.log("📂 MONGO_DB COMPLIANCE NODE INTEGRATION COMPLETED SUCCESSFULLY FOR NAWI_DB");
        seedEmpire();
        server.listen(PORT, () => {
            console.log(`👑 NAWI-EMPIRE CORE INFRASTRUCTURE SERVER RUNNING ON SYSTEM NODE PORT : ${PORT}`);
            console.log(`🛡️  SYSTEM ENFORCEMENT WATERMARK CODE: ${SYSTEM_WATERMARK}`);
            console.log("==========================================================================");
        });
    })
    .catch((error) => {
        console.error('[CRITICAL CORRUPTION]: Database operational connection aborted:', error.message);
        process.exit(1);
    });
