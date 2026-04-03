const User = require('./models/User'); // Your MongoDB User Schema
const Message = require('./models/Message'); // For the Inbox

exports.registerCitizen = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // 1. Create the Profile at Zero
        const newCitizen = new User({
            username,
            password, // In production, use bcrypt.hash(password, 10)
            email,
            rank: 'Citizen',
            level: 0,
            empireCoins: 5, // 🪙 The First-Time Bonus
            pillarsManaged: ["Home", "Inbox", "Market"]
        });

        const savedUser = await newCitizen.save();

        // 2. Trigger the Welcome Transmission to the Inbox
        const welcomeMsg = new Message({
            recipientId: savedUser._id,
            sender: "Empire Authority",
            icon: "fa-solid fa-bullhorn",
            text: `Welcome to the 7 Pillars, Citizen ${username}. Your 5-Coin Bonus is active. Manage your pillars wisely to reach Level 1.`,
            type: "ANNOUNCEMENT"
        });

        await welcomeMsg.save();

        res.status(201).json({ 
            success: true, 
            message: "Citizen Registered. Welcome to NAWI-EMPIRE." 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registration Failed: " + err.message });
    }
};
