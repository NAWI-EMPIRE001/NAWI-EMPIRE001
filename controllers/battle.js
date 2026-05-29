// controllers/battles.js
const mongoose = require('mongoose');

// Absolute path tracking to your standardized production folder models
const User = require('../models/User');               // Maps directly to NAWI_DB.users
const Meal = require('../models/Meal');               // Unified kitchenmeals model 
const Battle = require('../models/Battle');           // Maps directly to NAWI_DB.gaming_battles

// SOVEREIGN BYPASS SECURE PLATFORM CONSTANTS
const SOVEREIGN_ID = "NAWI-EMPIRE001"; 
const MASTER_PASS_NAME = "7 pillars";   

/**
 * 🎮 AUTOMATED ENGINE 1: INITIALIZE OR JOIN ACTIVE CHALLENGE ARENA
 * Enforces the zero-balance guardrail rule: Users cannot battle without active platform footprints.
 */
exports.initializeBattleSession = async (req, res) => {
    try {
        const { challengerId, opponentId, sectionType } = req.body;
        const currentSection = sectionType || 'Gaming';

        // 1. MASTER SOVEREIGN BYPASS SECURITY OVERRIDE
        if (challengerId === SOVEREIGN_ID) {
            return res.status(200).json({
                success: true,
                message: `Sovereign Authority Verified: Welcome, [${MASTER_PASS_NAME}]. All platform gates bypassed.`,
                bypass_active: true,
                arena_status: "MASTER_OVERRIDE_ENABLED"
            });
        }

        // 2. ZERO BALANCE & VERIFICATION CHECK (Guardrail Security Engine)
        const player = await User.findOne({ userId: challengerId });
        if (!player) {
            return res.status(404).json({ success: false, message: "User account footprint not found on the platform." });
        }

        // Check if user balance is zero before allowing the match challenge to broadcast
        const coinsBalance = parseFloat(player.wallet.empire_coins || 0);
        if (coinsBalance <= 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Action Denied: You cannot challenge other citizens or stream with a zero balance. Recharge your Empire Wallet." 
            });
        }

        // 3. GENERATE THE SECURE ANTI-SCAM ENTRY RECORD IN MONGO_DB
        const newBattle = new Battle({
            challenger_id: challengerId,
            opponent_id: opponentId,
            status: 'PENDING',
            wager_type: 'XP_AND_RANK_ONLY', // Strict non-gambling configuration
            empire_coin_check_passed: true
        });

        await newBattle.save();

        return res.status(201).json({
            success: true,
            message: "Anti-Scam Arena Battle Session successfully initiated.",
            arena: {
                battle_id: newBattle._id,
                status: newBattle.status,
                wager_protocol: newBattle.wager_type,
                section: currentSection
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 🎁 AUTOMATED ENGINE 2: LIVE STREAM GIFT SYNC SYSTEM
 * Translates live gift tokens directly into verified trust metrics for target profiles.
 */
exports.sendBattleGift = async (req, res) => {
    try {
        const { battleId, senderUserId, receiverUserId, giftType, empireCoinsSpent, mealId } = req.body;
        const isSovereign = (senderUserId === SOVEREIGN_ID);

        // 1. ENFORCE WALLET BALANCE LOCKUP
        if (!isSovereign) {
            const sender = await User.findOne({ userId: senderUserId });
            if (!sender || parseFloat(sender.wallet.empire_coins || 0) < empireCoinsSpent) {
                return res.status(403).json({ success: false, message: "Insufficient internal token resources to execute gift." });
            }

            // Deduct from sender wallet, add directly to creator total earnings
            await User.findOneAndUpdate({ userId: senderUserId }, { $inc: { "wallet.empire_coins": -empireCoinsSpent } });
            await User.findOneAndUpdate({ userId: receiverUserId }, { 
                $inc: { 
                    "wallet.empire_coins": empireCoinsSpent,
                    "wallet.total_earned_to_date": empireCoinsSpent
                } 
            });
        }

        // 2. SYNC BATTLE STATUS IF APPLICABLE
        if (battleId) {
            await Battle.findByIdAndUpdate(battleId, { $set: { status: 'ACTIVE' } });
        }

        // 3. EVALUATE AUTOMATED SELLER VERIFICATION GATES (IF KITCHEN LIVESTREAM)
        if (mealId) {
            const activeMeal = await Meal.findById(mealId);
            if (activeMeal) {
                // Gifts directly accelerate high-end status progression
                if (empireCoinsSpent >= 50) {
                    await Meal.findByIdAndUpdate(mealId, {
                        $set: { 
                            "trust_and_security.is_verified_seller": true,
                            "trust_and_security.audit_status": "APPROVED"
                        }
                    });
                }
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: "Empire Coin Gift successfully verified and synchronized across structural node ledgers."
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * 🏅 AUTOMATED ENGINE 3: BATTLE CONCLUSION & ADVANCEMENT PROCESSING
 * Hands out rank levels and XP status validation without using real money payouts.
 */
exports.processJuryInteraction = async (req, res) => {
    try {
        const { battleId, winnerId } = req.body;

        const activeBattle = await Battle.findById(battleId);
        if (!activeBattle) {
            return res.status(404).json({ success: false, message: "Target challenge validation instance missing." });
        }

        if (activeBattle.status === 'COMPLETED') {
            return res.status(400).json({ success: false, message: "This world challenge has already been concluded." });
        }

        // Lock down the winner and update state to match Code 2 requirements
        activeBattle.status = 'COMPLETED';
        activeBattle.winner_id = winnerId;
        await activeBattle.save();

        // Increment platform experience parameters to push user towards the worldwide monetization gate
        await User.findOneAndUpdate({ userId: winnerId }, {
            $inc: { 
                "metrics.activity_score": 50,
                "metrics.daily_streak": 1 
            }
        });

        return res.status(200).json({
            success: true,
            message: "Worldwide Gaming Challenge Concluded. Winner parameters upgraded.",
            status: "COMPLETED",
            validated_winner: winnerId
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
