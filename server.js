/* NAWI-EMPIRE MASTER ENGINE 
   Sovereign Edition 2026
   Target: Node.js / MongoDB Atlas
*/

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

// --- ⚙️ 1. MIDDLEWARE CONFIGURATION ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Multer for HD Content Handling (50MB Limit)
const storage = multer.memoryStorage();
const upload = multer({ limits: { fileSize: 50 * 1024 * 1024 } }); 

// --- ☣️ 2. GLOBAL SYSTEM STATE ---
let isSystemLocked = false; 

// --- 🏛️ 3. DATABASE SCHEMAS & MODELS ---

// User/Citizen Schema
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    username: { type: String, default: "Authenticated Citizen" },
    email: String,
    password: { type: String, select: false },
    deviceId: String,
    bio: { type: String, default: "No professional knowledge shared yet." },
    pfpUrl: { type: String, default: "/assets/default-pfp.png" },
    empireCoins: { type: Number, default: 0 },
    totalEarningsUSD: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    rank: { type: String, default: "Citizen" },
    ruleViolations: { type: Number, default: 0 },
    pillarsManaged: [String],
    activityLog: [{ action: String, timestamp: { type: Date, default: Date.now } }]
});
const User = mongoose.model('User', userSchema);

// Content/Post Schema
const postSchema = new mongoose.Schema({
    authorName: String,
    authorId: String,
    mediaUrl: String,
    description: String,
    type: { type: String, enum: ['graphic', 'video', 'lifestyle', 'audio', 'market'], default: 'lifestyle' },
    priceInCoins: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isMasterPost: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Imperial Message Schema
const messageSchema = new mongoose.Schema({
    recipientId: String,
    sender: String,
    text: String,
    type: { type: String, default: "P2P ALERT" },
    icon: { type: String, default: "fa-solid fa-bell" },
    timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// --- 🛡️ 4. SECURITY GATEKEEPER ---
app.use((req, res, next) => {
    const userId = req.headers['user-id'];
    if (isSystemLocked && userId !== "NAWI-EMPIRE001") {
        return res.status(503).json({ 
            message: "SYSTEM UNDER MAINTENANCE. PLEASE WAIT FOR THE FOUNDER." 
        });
    }
    next();
});

// --- 👤 5. IDENTITY & DEEP INQUIRY BOT ---

// Deep Inquiry Bot Endpoint
app.post('/api/bot/inquiry', (req, res) => {
    const { userInput } = req.body;
    const input = userInput.toLowerCase();

    if (input.includes("what is") || input.includes("about")) {
        return res.json({ response: "NAWI-EMPIRE is a Sovereign Ecosystem built to protect Founders. We value integrity over profit and operate under the Seven Pillars." });
    }

    if (input.includes("who is the owner") || input.includes("who is the ceo")) {
        return res.json({ response: "The Architect's identity is hidden within the shadows of the Seven Pillars. Only those who seek the true foundation of the Empire may know. Type 'REVEAL 001' if you are prepared for the truth." });
    }

    if (input === "reveal 001") {
        return res.json({ response: "Leadership Confirmed: NAWI-EMPIRE001. Social Identity: 7 Pillars. General Name: NAWI-EMPIRE. You have looked deeper; now you must build stronger." });
    }

    res.json({ response: "The Empire is listening. Your query has been logged to the Seven Pillars." });
});

// Authentication
app.post('/api/register', async (req, res) => {
    const { email, password, deviceId } = req.body;
    try {
        const existingDevice = await User.findOne({ deviceId });
        if (existingDevice) return res.status(403).json({ success: false, message: "⚠️ SYSTEM ALERT: One Node per Human allowed." });
        
        const newUser = new User({ email, password, deviceId, userId: new mongoose.Types.ObjectId().toString() });
        await newUser.save();
        res.json({ success: true, userId: newUser.userId });
    } catch (err) { res.status(500).json({ error: "Security Vault Error." }); }
});

app.post('/api/login', async (req, res) => {
    if (req.body.email === "akpanvictor848@gmail.com" && req.body.password === "$Nsikak111") {
        return res.status(200).json({ success: true, token: "FOUNDER_001", userId: "NAWI-EMPIRE001" });
    }
    res.status(401).json({ success: false, message: "Invalid Imperial Credentials." });
});

// --- 📡 6. CONTENT ENGINE ---
app.get('/api/get-feed', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/upload-asset', upload.single('mediaFile'), async (req, res) => {
    try {
        const { authorId, description, type, price, name, mediaUrl } = req.body;
        const user = await User.findOne({ userId: authorId });
        if (!user) return res.status(404).json({ message: "Citizen not found." });

        const newPost = new Post({
            authorName: name || user.username,
            authorId: authorId,
            mediaUrl: mediaUrl,
            description: description,
            type: type,
            priceInCoins: price || 0,
            isMasterPost: (authorId === "NAWI-EMPIRE001")
        });
        await newPost.save();
        res.status(201).json({ success: true, message: "Asset Logged to Empire Ledger" });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 💰 7. ECONOMY & GIFTING ($0.02 Payout) ---
const GIFTS = {
    rose: { cost: 1, minLevel: 0, label: "Imperial Rose" },
    crown: { cost: 500, minLevel: 5, label: "Empire Crown" },
    sov7: { cost: 50000, minLevel: 10, label: "Sovereign 7" },
    lion: { cost: 500000, minLevel: 15, label: "Empire Lion" }
};

app.post('/api/send-gift', async (req, res) => {
    try {
        const { senderId, receiverId, giftKey, isPrivate } = req.body;
        const gift = GIFTS[giftKey];
        const sender = await User.findOne({ userId: senderId });
        const receiver = await User.findOne({ userId: receiverId });

        if (sender.empireCoins < gift.cost) return res.status(400).json({ message: "Insufficient Coins." });

        sender.empireCoins -= gift.cost;
        receiver.totalEarningsUSD += (gift.cost * 0.02);

        await sender.save(); await receiver.save();
        res.json({ success: true, newBalance: sender.empireCoins });
    } catch (err) { res.status(500).json({ error: "Transaction Failed." }); }
});

// --- ⚖️ 8. MONITORING & OVERRIDE ---
app.post('/api/global-monitor', async (req, res) => {
    const { userId, content } = req.body;
    const BANNED = [/t\.me\//i, /chat\.whatsapp\.com/i];
    if (BANNED.some(p => p.test(content))) {
        await User.updateOne({ userId }, { $inc: { ruleViolations: 1 } });
        return res.json({ success: false, message: "Rule Violation logged." });
    }
    res.json({ success: true });
});

app.post('/api/admin/self-destruct', (req, res) => {
    if (req.body.masterPin !== "7777") return res.status(403).json({ message: "DENIED" });
    isSystemLocked = (req.body.action === "LOCK_ALL");
    res.json({ success: true, message: isSystemLocked ? "LOCKED" : "RESTORED" });
});

app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

// --- ⚙️ 9. ENGINE START ---
const URI = "mongodb+srv://NAWI-EMPIRE001:NAWI-EMPIRE001@nawi-empire001.zwidxex.mongodb.net/NAWI_DB?retryWrites=true&w=majority";
const PORT = process.env.PORT || 10000;

mongoose.connect(URI).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
    });
}).catch(err => console.error("Database Connection Failure:", err));
