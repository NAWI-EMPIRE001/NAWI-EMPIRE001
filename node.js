const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('./'));

// --- 1. CONFIGURATION & MASTER AUTHORITY ---
const NAWI_CONFIG = {
    founder_id: "NAWI-EMPIRE001", // Your internal CEO ID
    founder_email: "akpanvictor848@gmail.com", // Your authorized email
    founder_pass: "$Nsikak111", // Your master password
    unit: "Coin 🪙",
    stores: {
        ios: "https://apps.apple.com/app/nawi-empire", 
        android: "https://play.google.com/store/apps/nawi-empire", 
        web: "/app-grid.html" 
    }
};

const uri = process.env.MONGODB_URI || "mongodb+srv://akpanvictor848_db_user:NAWI-EMPIRE@nawi-empire.3qj9wnj.mongodb.net/?appName=NAWI-EMPIRE";
const client = new MongoClient(uri);

// --- 2. THE EMPIRE LOGIC ---
async function startPlatform() {
    try {
        await client.connect();
        const db = client.db("NAWI-EMPIRE");
        const posts = db.collection("posts");
        const users = db.collection("users");
        console.log("NAWI-EMPIRE Cluster Active: Founder Authority Verified.");

        // 🛡️ GATEWAY: One QR Code Logic
        app.get('/gateway', (req, res) => {
            const userAgent = req.headers['user-agent'].toLowerCase();
            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                return res.redirect(NAWI_CONFIG.stores.ios);
            } else if (userAgent.includes('android')) {
                return res.redirect(NAWI_CONFIG.stores.android);
            } else {
                return res.redirect('/login.html'); 
            }
        });

        // 🔑 AUTH: Founder & Top User Login
        app.post('/api/login', (req, res) => {
            const { email, password } = req.body;
            if (email === NAWI_CONFIG.founder_email && password === NAWI_CONFIG.founder_pass) {
                res.json({ success: true, role: "FOUNDER", redirect: "/app-grid.html" });
            } else {
                res.status(401).json({ success: false, message: "Credential rejected by 7 Pillars." });
            }
        });

        // 📈 ADS & BOOST: Promotion Logic
        app.post('/api/ads/boost', async (req, res) => {
            const { postId, cost } = req.body; // Usually 5 Coins 🪙
            // Logic to deduct 5 Coins from user vault and set status to 'boosted'
            await posts.updateOne({ _id: postId }, { $set: { type: 'boosted_ad', expiry: new Date(Date.now() + 86400000) } });
            res.json({ success: true, message: "Listing boosted for 24 hours." });
        });

        // 🛒 CONTENT & MARKETPLACE: Save Post
        app.post('/api/posts/create', async (req, res) => {
            const doc = {
                author: req.body.author || "7 PILLARS CITIZEN",
                content: req.body.content,
                type: req.body.type || "standard", 
                timestamp: new Date(),
                likes: Math.floor(Math.random() * 50) // Makes the platform look busy
            };
            await posts.insertOne(doc);
            res.json({ success: true });
        });

        // 📊 FEED: Load Activity (Boosted posts first)
        app.get('/api/posts/feed', async (req, res) => {
            const data = await posts.find().sort({ type: -1, timestamp: -1 }).toArray();
            res.json(data);
        });

        // 🏛️ FALLBACK: Direct to Login
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'login.html'));
        });

    } catch (e) { 
        console.error("Critical Empire Error:", e); 
    }
}

// --- 3. START ---
startPlatform();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`NAWI-EMPIRE Running: Port ${PORT}`);
});
