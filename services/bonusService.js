// services/bonusService.js

const BonusLedger = require('../models/BonusLedger');
const UserMilestone = require('../models/UserMilestone');

class BonusService {

    /**
     * Initialize welcome bonus
     */
    static async initializeWelcomeBonus(userId) {

        const existing = await BonusLedger.findOne({ user: userId });

        if (existing) return existing;

        const welcomeCredits =
            Number(process.env.WELCOME_BONUS_CREDITS || 50);

        const ledger = await BonusLedger.create({
            user: userId,
            totalCredits: welcomeCredits,
            lockedCredits: welcomeCredits,
            unlockedCredits: 0,
            status: 'LOCKED'
        });

        await UserMilestone.findOneAndUpdate(
            { user: userId },
            { user: userId },
            { upsert: true, new: true }
        );

        return ledger;
    }

    /**
     * Unlock bonus after milestone completion
     */
    static async unlockBonus(userId) {

        const ledger = await BonusLedger.findOne({
            user: userId
        });

        if (!ledger)
            throw new Error('Bonus ledger not found');

        if (ledger.status === 'UNLOCKED')
            return ledger;

        ledger.unlockedCredits += ledger.lockedCredits;
        ledger.lockedCredits = 0;
        ledger.status = 'UNLOCKED';
        ledger.isUnlocked = true;

        await ledger.save();

        return ledger;
    }

    /**
     * Get user bonus balance
     */
    static async getBonus(userId) {
        return BonusLedger.findOne({ user: userId });
    }
}

module.exports = BonusService;