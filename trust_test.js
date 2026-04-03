// THE TRUST-TEST WITHDRAWAL LOGIC
app.post('/api/wallet/test-withdrawal', async (req, res) => {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);

    // 1. RULE: Cannot withdraw the Signup Bonus
    if (user.earnedCoins < (amount / 0.02)) {
        return res.status(400).json({ 
            message: "Bonus coins are for platform use only. Please earn $2.00 to test withdrawal." 
        });
    }

    // 2. RULE: Only the FIRST withdrawal is "Instant & Small"
    if (user.withdrawalCount === 0 && amount <= 2.00) {
        user.earnedCoins -= (amount / 0.02);
        user.withdrawalCount += 1;
        
        // AUTO-DISBURSE (No Master Approval needed for the $2 Test)
        await processInstantBankTransfer(user.bankDetails, amount);
        
        await user.save();
        return res.json({ 
            success: true, 
            message: "Trust-Test Successful. Your $2.00 is on the way to your bank!" 
        });
    }

    // 3. Any withdrawal AFTER the first one goes to the Master's Spark 30C
    return res.json({ message: "Request sent to the Master for Imperial Seal." });
});
