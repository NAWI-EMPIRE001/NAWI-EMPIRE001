// THE INDUCTION SCHEMA (server.js)
const UserSchema = new mongoose.Schema({
    // ... existing fields ...
    hasAcceptedDecree: { type: Boolean, default: false },
    inductionTimestamp: Date
});

// THE GATEKEEPER MIDDLEWARE
app.get('/api/check-access', async (req, res) => {
    const user = await User.findById(req.user.id);
    
    if (!user.hasAcceptedDecree) {
        return res.json({ 
            access: "DENIED", 
            redirectTo: "/induction-decree",
            message: "You must swear to the Imperial Laws before entry." 
        });
    }
    
    res.json({ access: "GRANTED" });
});
