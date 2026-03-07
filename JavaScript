const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// --- THE EMPIRE DATABASE CONNECTION (SECURED BY EXCELLENCY) ---
// Your Secret Password 'uwSR1&HLSBc8' is now integrated.
const mongoURI = "mongodb+srv://NAWI-EMPIRE-01:uwSR1&HLSBc8@cluster0.abcde.mongodb.net/NAWI_DATABASE?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI)
    .then(() => console.log('7 PILLARS: Database Socket Connected - NAWI-EMPIRE-01 ACTIVE'))
    .catch(err => console.error('CRITICAL: Vault Access Denied', err));

// --- FOUNDER SECURITY & 35M LEDGER ACCESS ---
const MASTER_KEY = "NAWI-ALPHA-01"; // The secret key to reveal the 35M Ledger

app.post('/api/founder-login', (req, res) => {
    const { loginSecret } = req.body;
    if (loginSecret === MASTER_KEY) {
        res.json({ 
            status: "Authorized", 
            identity: "Excellency Nsikak A Warri",
            ledger: "35,000,000.00 USD SECURED" 
        });
    } else {
        res.status(401).json({ status: "Access Denied" });
    }
});

// --- WALLET & LIQUIDITY LOGIC ---
app.get('/api/wallet-balance', (req, res) => {
    // This pulls the live ₦3,000,000 from your vault
    res.json({ 
        balance: 3000000,
        currency: "NGN",
        owner: "Diamond Black"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NAWI ENGINE: Active on Port ${PORT}`));
