const express = require('express');
const cors = require('cors');
const path = require('path');

// 👑 IMPORT MODELS & DB CONNECTION
// Ensure your db-connect.js is updated to export 'db' or 'mongoose.connection.db'
const { mongoose, KitchenMeal, pushToGlobalMarket } = require('./db-connect');

const app = express();
const db = mongoose.connection; // Accessing the raw driver for direct collection inserts

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// --- 🛡️ FOUNDER SECURITY MIDDLEWARE ---
// This protects your Master Vault from being seen by regular users
const authorizeFounder = (req, res, next) => {
    const token = req.headers.authorization;
    if (token === "FOUNDER_001") {
        next();
    } else {
        res.status(403).json({ success: false, message: "Empire Authority Required." });
    }
};

// --- 💰 P2P WITHDRAWAL SYSTEM ---

// 1. User submits a request
app.post('/api/request-withdrawal', async (req, res) => {
    const { userId, name, account, amount } = req.body;

    try {
        const withdrawalRequest = {
            userId: userId || "GUEST_FOUNDER",
            fullName: name,
            accountDetails: account,
            amount: parseFloat(amount),
            status: "PENDING_AUTHORIZATION",
            timestamp: new Date()
        };

        // Saving to a new 'withdrawals' collection
        await db.collection('withdrawals').insertOne(withdrawalRequest);
        
        res.status(200).json({ 
            success: true, 
            message: "Sovereign Authorization Logged. Awaiting Founder Approval." 
        });
    } catch (err) {
        console.error("Vault Sync Error:", err);
        res.status(500).json({ success: false, message: "Vault Sync Error." });
    }
});

// 2. CEO fetches all pending requests (Protected)
app.get('/api/get-withdrawals', authorizeFounder, async (req, res) => {
    try {
        const requests = await db.collection('withdrawals').find({ status: "PENDING_AUTHORIZATION" }).toArray();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Unable to sync with Ledger." });
    }
});

// 3. CEO approves or rejects a request (Protected)
app.post('/api/update-withdrawal', authorizeFounder, async (req, res) => {
    const { id, status } = req.body;
    try {
        const { ObjectId } = require('mongodb');
        await db.collection('withdrawals').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status, processedAt: new Date() } }
        );
        res.json({ success: true, message: `Asset ${status}` });
    } catch (err) {
        res.status(500).json({ success: false, message: "Update Failed." });
    }
});


// --- 📦 KITCHEN & GLOBAL MARKET ---

app.get('/api/get-products', async (req, res) => {
    try {
        const products = await KitchenMeal.find({}).sort({ _id: -1 }); 
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Internal Empire Error" });
    }
});

app.post('/api/add-product', async (req, res) => {
    try {
        const result = await pushToGlobalMarket(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: "Vault Entry Failed" });
    }
});


// --- 🔐 FOUNDER LOGIN (IDENTITY VERIFICATION) ---
const ADMIN_EMAIL = "akpanvictor848@gmail.com";
const ADMIN_PASS = "$Nsikak111";

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.status(200).json({ success: true, token: "FOUNDER_001" });
    }
    res.status(401).json({ success: false, message: "Invalid Identity" });
});


// --- ⚙️ SYSTEM HEALTH & ROUTING ---
app.get('/health', (req, res) => { res.status(200).send('Empire Engine Active'); });

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NAWI-EMPIRE ENGINE ACTIVE ON PORT ${PORT}`);
});

