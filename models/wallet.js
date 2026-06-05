// THE IMPERIAL WALLET SCHEMA (server.js)
const WalletSchema = new mongoose.Schema({
    userId: String,
    coinBalance: { type: Number, default: 5 }, // 5 Coin Signup Bonus
    usdEarnings: { type: Number, default: 0.00 },
    nairaBalance: { type: Number, default: 0.00 },
    transactionHistory: [{
        type: { type: String, enum: ['Deposit', 'Withdrawal', 'Tribute', 'Royalty'] },
        amount: Number,
        currency: String,
        status: { type: String, default: 'Verified' },
        timestamp: { type: Date, default: Date.now }
    }]
});

// THE PAYOUT CALCULATION (Converting Coins to USD)
app.post('/api/wallet/claim-royalty', async (req, res) => {
    const { userId, coinAmount } = req.body;
    const wallet = await Wallet.findOne({ userId });

    if (wallet.coinBalance < coinAmount) {
        return res.status(400).json({ message: "Insufficient Coins to convert." });
    }

    // Apply the Empire $0.02 Logic
    const payoutUSD = coinAmount * 0.02;
    wallet.coinBalance -= coinAmount;
    wallet.usdEarnings += payoutUSD;

    await wallet.save();
    res.json({ success: true, newUSDBalance: wallet.usdEarnings });
});
