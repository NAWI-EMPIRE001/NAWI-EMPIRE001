// THE VERIFICATION CONTROLLER (server.js)
app.post('/api/master/verify-user', async (req, res) => {
    const { masterSecret, targetUserId, pillarCategory } = req.body;

    // 1. Security Check: Only the Master can run this
    if (masterSecret !== "EMPIRE_7_SECRET_2024") {
        return res.status(403).json({ message: "Unauthorized Authority." });
    }

    try {
        const user = await User.findById(targetUserId);
        
        // 2. Upgrade the Citizen
        user.isVerified = true;
        user.rank = `Verified ${pillarCategory} Merchant`; // e.g., Verified Music Merchant
        user.level = 10; // Instantly boost to high level
        
        // 3. Send the Imperial Notification
        const badgeAlert = new Message({
            recipientId: targetUserId,
            sender: "Empire Authority",
            text: `Congratulations. You have been awarded the Golden 7 Badge for your talent in ${pillarCategory}.`,
            icon: "fa-solid fa-certificate",
            type: "ANNOUNCEMENT"
        });

        await user.save();
        await badgeAlert.save();

        res.json({ success: true, message: `User ${user.username} is now a Verified Merchant.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
