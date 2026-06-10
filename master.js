require('dotenv').config(); // Loads environment variables
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require('./db-connect'); // Links to your database connection file

const app = express();
const PORT = process.env.PORT || 10000; // Automatically handles Render's port binding

// 1. Core Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enables smooth secure connections between frontend and backend

// 2. Database Model Definitions (Required for your routes)
const MasterControlSchema = new mongoose.Schema({
    masterId: String,
    targetUserId: String,
    action: { type: String, enum: ['ENTER_PRIVATE_LIVE', 'FREEZE_COINS', 'DELETE_POST', 'SHUTDOWN_STREAM'] },
    timestamp: { type: Date, default: Date.now }
});
const MasterControl = mongoose.model('MasterControl', MasterControlSchema);

// Placeholder schemas for Vault and LiveSession so your routes execute flawlessly
const VaultSchema = new mongoose.Schema({
    naira: { type: Number, default: 0 },
    usdSpread: { type: Number, default: 0 }
});
const Vault = mongoose.model('Vault', VaultSchema);

const LiveSessionSchema = new mongoose.Schema({
    status: { type: String, default: 'active' }
});
const LiveSession = mongoose.model('LiveSession', LiveSessionSchema);


// 3. Core Operational Routes

// Base Check Route to confirm the master node is online
app.get('/', (req, res) => {
    res.status(200).json({
        status: "online",
        platform: "NAWI-EMPIRE001 Ecosystem",
        node: "Master Omni-Control Engine"
    });
});

// THE "OMNI-PASS" MIDDLEWARE
app.get('/api/master/entry/:streamId', async (req, res) => {
    const { adminSecret, myUserId } = req.query;

    // Check if the user is the Master (YOU)
    if (adminSecret !== "EMPIRE_7_SECRET_2024") {
        return res.status(403).json({ message: "You do not have Master Authority." });
    }

    // Master enters any stream - Bypass "Request to Join"
    res.json({
        access: "GRANTED",
        role: "THE_MASTER",
        capabilities: ["Can_Mute_All", "See_Private_Gifts", "End_Stream"]
    });
});

// THE 7 PILLARS REVENUE TRACKER (For Your Eyes Only)
app.get('/api/master/vault-stats', async (req, res) => {
    try {
        // Total Coins Bought ($0.10) vs Total Coins Gifted ($0.02)
        let totalVault = await Vault.findOne(); 
        
        // Setup a backup fallback placeholder if the vault collection hasn't initialized yet
        if (!totalVault) {
            totalVault = { naira: 0, usdSpread: 0 };
        }

        res.json({
            nairaReserve: totalVault.naira,
            usdSpread: totalVault.usdSpread, // The 80% profit you keep
            activeStreams: await LiveSession.countDocuments({ status: 'active' })
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to pull data from Vault layer.", details: error.message });
    }
});


// 4. Initialization Pipeline
const bootSystem = async () => {
    console.log("Initializing master node systems...");
    
    // Connect to the database cluster via db-connect.js
    await connectDB();

    // Start server listener
    app.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`  🚀 MASTER ENGINE RUNNING ACTIVE ON PORT: ${PORT}`);
        console.log(`  Ecosystem: NAWI-EMPIRE001 City of Multipillars`);
        console.log(`=======================================================`);
    });
};

bootSystem();
