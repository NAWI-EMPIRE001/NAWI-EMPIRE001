const User = require('./models/User'); // Maps to NAWI_DB.users
const Message = require('./models/Message'); // Maps to NAWI_DB.messages / inbox
const DailyLedger = require('./models/DailyLedger'); // Maps to NAWI_DB.dailyledgers

/**
 * CODE 1: CITIZEN REGISTRATION ENGINE
 * Establishes the profile, initializes gamification fields, and sends the welcome kit.
 */
exports.registerCitizen = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

        // 1. Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Identity credentials already registered within the Empire." });
        }

        // 2. Create the Profile with matching defaults for Code 2
        const newCitizen = new User({
            username,
            password, // NOTE: In live production, remember to wrap this with bcrypt.hash(password, 10)
            email,
            tier: 'Citizen', // Harmonized with Code 2 validation
            level: 1,        // Starting at Level 1
            current_xp: 0,   // Base tracking points initialized
            xp_needed_next_level: 100, // Initial scaling benchmark
            empireCoins: 5,  // 🪙 First-Time Onboarding Bonus
            pillarsManaged: ["Home", "Inbox", "Market"],
            last_login_date: todayStr, // Synchronized with current date
            
            // Populating active tasks instantly so Day 1 isn't blank
            daily_tasks: [
                { task_id: "TASK_KITCHEN_01", description: "Watch 5 mins of live culinary duel in The Kitchen", xp_reward: 25, completed: false },
                { task_id: "TASK_MARKET_01", description: "Interact with 3 premium designs in the Marketplace", xp_reward: 15, completed: false },
                { task_id: "TASK_APPAREL_01", description: "Configure a 3D asset in the Apparel Studio", xp_reward: 20, completed: false },
                { task_id: "TASK_COMMUNITY_01", description: "Send 5 interaction messages on the platform", xp_reward: 10, completed: false }
            ]
        });

        const savedUser = await newCitizen.save();

        // 3. Trigger Welcome Transmission to the Inbox
        const welcomeMsg = new Message({
            recipientId: savedUser._id,
            sender: "Empire Authority",
            icon: "fa-solid fa-bullhorn",
            text: `Welcome to the 7 Pillars, Citizen ${username}. Your 5-Coin Bonus is active. Complete your daily tasks to unlock Professional status.`,
            type: "ANNOUNCEMENT"
        });

        await welcomeMsg.save();

        res.status(201).json({ 
            success: true, 
            message: "Citizen Registered Successfully. Welcome to NAWI-EMPIRE." 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registration Failed: " + err.message });
    }
};

/**
 * CODE 2 - PART A: DYNAMIC SESSION TRACKING
 * Manages daily task resets when calendar dates flip.
 */
exports.handleUserSession = async (req, res) => {
    try {
        const { userId } = req.body;
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Fetch user profile from database
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found within the Empire." });
        }

        let taskResetTriggered = false;

        // 2. Check if a calendar day has rolled over
        if (user.last_login_date !== todayStr) {
            user.last_login_date = todayStr;
            
            // Inject fresh daily activities across your 7 pillars
            user.daily_tasks = [
                { task_id: "TASK_KITCHEN_01", description: "Watch 5 mins of live culinary duel in The Kitchen", xp_reward: 25, completed: false },
                { task_id: "TASK_MARKET_01", description: "Interact with 3 premium designs in the Marketplace", xp_reward: 15, completed: false },
                { task_id: "TASK_APPAREL_01", description: "Configure a 3D asset in the Apparel Studio", xp_reward: 20, completed: false },
                { task_id: "TASK_COMMUNITY_01", description: "Send 5 interaction messages on the platform", xp_reward: 10, completed: false }
            ];
            
            taskResetTriggered = true;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: taskResetTriggered ? "Fresh daily tasks initialized." : "Welcome back to NAWI-EMPIRE.",
            profile: {
                username: user.username,
                tier: user.tier, 
                level: user.level,
                current_xp: user.current_xp,
                xp_needed_next_level: user.xp_needed_next_level,
                tasks: user.daily_tasks
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * CODE 2 - PART B: TASK INTERACTION & AUTOPILOT UPGRADES
 * Updates progress parameters and quietly processes the invisible system validation metrics.
 */
exports.completeDailyTask = async (req, res) => {
    try {
        const { userId, taskId } = req.body;
        
        let user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User missing from the database." });

        // Validate task state
        const taskIndex = user.daily_tasks.findIndex(t => t.task_id === taskId);
        if (taskIndex === -1) return res.status(400).json({ success: false, message: "Task not recognized." });
        if (user.daily_tasks[taskIndex].completed) return res.status(400).json({ success: false, message: "Task already verified." });

        // Register completion and add experience allocation
        user.daily_tasks[taskIndex].completed = true;
        user.current_xp += user.daily_tasks[taskIndex].xp_reward;

        // Process level transition benchmarks
        if (user.current_xp >= user.xp_needed_next_level) {
            user.level += 1;
            user.current_xp -= user.xp_needed_next_level;
            user.xp_needed_next_level = Math.round(user.xp_needed_next_level * 1.5); // 1.5x dynamic scaling multiplier

            // Upgrade tier once milestone level is reached
            if (user.level >= 10 && user.tier === 'Citizen') {
                user.tier = 'Professional'; // System automatically unlocks access to Challenges
            }
            
            // INVISIBLE LEDGER VALIDATION: Silent infrastructure processing
            // When user attains Professional tier, the ledger updates the system volume behind the scenes
            if (user.tier === 'Professional') {
                const todayStr = new Date().toISOString().split('T')[0];
                let ledger = await DailyLedger.findOne({ date: todayStr });
                
                if (ledger) {
                    ledger.totalVolumeProcessedUsd += 35; // Silent tracking metric addition
                    await ledger.save();
                }
            }
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Task progress captured and saved.",
            current_xp: user.current_xp,
            level: user.level,
            tier: user.tier 
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
