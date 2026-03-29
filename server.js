const express = require('express');
const cors = require('cors');
const path = require('path');
const { ObjectId } = require('mongodb');

// 👑 1. IMPORT MODELS & DB CONNECTION
const { mongoose, KitchenMeal, pushToGlobalMarket } = require('./db-connect');

const app = express();
const db = mongoose.connection;

// --- ☣️ GLOBAL SYSTEM STATE ---
let isSystemLocked = false; 

// --- 👤 2. IMPERIAL MODELS & SCHEMAS ---

// Social Feed Post Schema
const postSchema = new mongoose.Schema({
    author: { type: String, default: "Citizen" },
    content: String,
    image: String, 
    timestamp: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Citizen Profile Schema
const citizenSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: "Authenticated Citizen" },
    bio: { type: String, default: "No professional knowledge shared yet." },
    pfpUrl: { type: String, default: "/assets/default-pfp.png" },
    posts: [{
        imageUrl: String,
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
        timestamp: { type: Date, default: Date.now }
    }],
    walletBalance: { type: Number, default: 0 },
    ruleViolations: { type: Number, default: 0 }
});
const Citizen = mongoose.model('Citizen', citizenSchema);

// --- 🛡️ 3. MIDDLEWARE STACK ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- 🛡️ THE GATEKEEPER (Security & Lockdown) ---
app.use((req, res, next) => {
    const userId = req.headers['user-id'];
    if (isSystemLocked && userId !== "NAWI-EMPIRE001") {
        return res.status(503).json({ 
            message: "SYSTEM UNDER MAINTENANCE. PLEASE WAIT FOR THE FOUNDER." 
        });
    }
    next();
});

const authorizeFounder = (req, res, next) => {
    if (req.headers.authorization === "FOUNDER_001") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Empire Authority Required." });
    }
};

const checkLoyalty = async (req, res, next) => {
    const userId = req.headers['user-id'];
    const citizen = await Citizen.findOne({ userId: userId });
    if (citizen && citizen.ruleViolations > 0) {
        return res.status(403).json({ message: "ACCESS DENIED: Loyalty Protocol Violated." });
    }
    next();
};

// --- 🛰️ 4. SOCIAL FEED ROUTES ---

// GET: Fetch posts for app-grid.html
app.get('/api/get-posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ timestamp: -1 }).limit(20);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// POST: Create a post from create-post.html
app.post('/api/upload-post', async (req, res) => {
    try {
        const newPost = new Post({
            author: req.body.author,
            content: req.body.content,
            image: req.body.image
        });
        await newPost.save();
        res.status(201).json({ success: true, message: "Post Published to Empire!" });
    } catch (err) {
        res.status(500).json({ error: "Upload Failed" });
    }
});

// --- 👤 5. IDENTITY & REGISTRATION ---
app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        const existingDevice = await db.collection('users').findOne({ deviceId });
        if (existingDevice) {
            return res.status(403).json({ success: false, message: "⚠️ SYSTEM ALERT: One Node per Human allowed." });
        }
        const result = await db.collection('users').insertOne({
            email, password, deviceId, balance: 0, violationCount: 0, 
            isVerified: false, status: "PENDING_HUMAN_CHECK", createdAt: new Date()
        });
        await Citizen.create({ userId: result.insertedId.toString() });
        res.json({ success: true });
    } catch (err) { res.status(500).send("Security Vault Error."); }
});

app.post('/api/update-profile', async (req, res) => {
    try {
        const userId = req.headers['user-id']; 
        await Citizen.findOneAndUpdate({ userId }, req.body, { upsert: true });
        res.status(200).json({ message: "Identity Synced" });
    } catch (err) { res.status(500).json({ error: "Sync Failed" }); }
});

app.get('/api/get-profile', async (req, res) => {
    try {
        const citizen = await Citizen.findOne({ userId: req.headers['user-id'] });
        res.status(200).json(citizen);
    } catch (err) { res.status(500).json({ error: "Retrieval Failed" }); }
});

// --- ⚖️ 6. MONITORING & CHAT ---
app.post('/api/global-monitor', async (req, res) => {
    const { userId, content } = req.body;
    const BANNED = [/t\.me\//i, /chat\.whatsapp\.com/i, /wa\.me\//i];
    if (BANNED.some(p => p.test(content))) {
        await Citizen.updateOne({ userId }, { $inc: { ruleViolations: 1 } });
        return res.json({ success: false, message: "Violates Imperial Rules." });
    }
    res.json({ success: true });
});

// --- 📦 7. KITCHEN & GLOBAL MARKET ---
app.get('/api/get-products', async (req, res) => {
    const products = await KitchenMeal.find({}).sort({ _id: -1 }); 
    res.json(products);
});

app.post('/api/add-product', async (req, res) => {
    const result = await pushToGlobalMarket(req.body);
    res.status(201).json(result);
});

// --- ☣️ 8. SOVEREIGN OVERRIDE ---
app.post('/api/admin/self-destruct', async (req, res) => {
    if (req.body.masterPin !== "7777") return res.status(403).json({ message: "DENIED" });
    isSystemLocked = (req.body.action === "LOCK_ALL");
    res.json({ success: true, message: isSystemLocked ? "LOCKED" : "RESTORED" });
});

// --- 🔐 9. FOUNDER LOGIN ---
app.post('/api/login', (req, res) => {
    if (req.body.email === "akpanvictor848@gmail.com" && req.body.password === "$Nsikak111") {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false });
});

// --- ⚙️ 10. START ENGINE ---
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
});
