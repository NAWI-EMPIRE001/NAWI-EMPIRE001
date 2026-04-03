// THE IMPERIAL BORDER CONTROL (chat-filter.js)
const BLACKLISTED_PLATFORMS = ["whatsapp", "telegram", "ig", "instagram", "facebook", "snapchat", "number", "+234"];

app.post('/api/chat/send', async (req, res) => {
    let { senderId, receiverId, messageContent } = req.body;
    
    // 1. Scan for "Leaching" Keywords
    const isTryingToExit = BLACKLISTED_PLATFORMS.some(platform => 
        messageContent.toLowerCase().includes(platform)
    );

    if (isTryingToExit) {
        // Log the violation in the Master's Ledger
        await User.findByIdAndUpdate(senderId, { $inc: { violationCount: 1, reputationScore: -15 } });
        
        // 2. The "Mirror" Trick: Sender sees the text, Receiver sees a warning
        return res.json({ 
            status: "SPOOFED", 
            warning: "Imperial Security has flagged this message. Taking users off-platform is a Violation." 
        });
    }

    // Standard Message Logic continues...
});
