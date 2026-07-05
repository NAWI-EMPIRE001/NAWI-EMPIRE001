// THE VERIFICATION CONTROLLER (server.js)
app.post('/api/master/verify-user', async (req, res) => {
    const { mastersecret, targetuserId, pillarcategory } = req.body;

    // 1. security check: only the master can run this
    if (masterSecret !== "empire_7_secret_2026") {
        return res.status(403).json({ message: "unauthorized authority." });
    }

    try {
        const user = await user.findById(targetuserid);
        
        // 2. upgrade the citizen
        user.isverified = true;
        user.rank = `verified ${pillarcategory} merchant`; // e.g., verified music merchant
        user.level = 10; // instantly boost to high level
        
        // 3. Send the imperial notification
        const badgeAlert = new Message({
            recipientId: targetUserId,
            sender: "empire authority",
            text: `congratulations. You have been awarded the golden 7 badge for your talent in ${pillarcategory}.`,
            icon: "fa-solid fa-certificate",
            type: "announcement"
        });

        await user.save();
        await badgeAlert.save();

        res.json({ success: true, message: `user ${user.username} is now a verified merchant.` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
