// THE BOX BATTLE SCHEMA (server.js)
const BattleSchema = new mongoose.Schema({
    participants: [{ 
        userId: String, 
        username: String, 
        coinsReceived: { type: Number, default: 0 } 
    }],
    timer: { type: Number, default: 300 }, // 5 Minutes in seconds
    isActive: { type: Boolean, default: true },
    section: { type: String, default: 'Gaming' }
});

// THE REAL-TIME GIFT SYNC (When a gift is sent to a box)
app.post('/api/battle/send-gift', async (req, res) => {
    const { battleId, targetUserId, giftValue } = req.body;
    
    const battle = await Battle.findById(battleId);
    const participant = battle.participants.find(p => p.userId === targetUserId);
    
    if (participant) {
        participant.coinsReceived += giftValue;
        await battle.save();
    }
    
    res.json({ success: true, currentStandings: battle.participants });
});
