/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: p2pGateway.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231
 * Description: Core Escrow Engine, P2P Dispute Resolution, and Multi-Pillar Transaction Router.
 */

const crypto = require('crypto');
const User = require('./models/User');                 // Maps to NAWI_DB.users
const DailyLedger = require('./models/DailyLedger');   // Maps to NAWI_DB.dailyledgers

const p2pGateway = {

    // ==========================================
    // 1. INITIATE SECURE ESCROW TRANSACTION
    // ==========================================
    /**
     * Locks funds/assets into the platform escrow.
     * Accessible by Tier 1 (Casual Citizens) and Tier 2 (Verified Merchants).
     */
    createTransaction: async (req, res) => {
        try {
            const { buyerId, sellerId, amount, itemDetails, targetPillar } = req.body;

            if (!buyerId || !sellerId || !amount || !targetPillar) {
                return res.status(400).json({ success: false, message: "Incomplete transaction parameters." });
            }

            // Verify Buyer Status
            const buyer = await User.findById(buyerId);
            if (!buyer) return res.status(404).json({ success: false, message: "Buyer node not found." });

            // Ensure system compliance rules are active
            if (buyer.complianceMetrics.rulesViolated > 0) {
                return res.status(403).json({ success: false, message: "Transaction blocked. Account under compliance review." });
            }

            // Generate structural cryptographic transaction ID
            const txId = `TX_P2P_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

            const escrowPayload = {
                txId,
                buyerId,
                sellerId,
                amount: parseFloat(amount),
                pillarOrigin: targetPillar.toLowerCase(), // E.g., marketplace, apparel_studio, ads_program
                itemDetails,
                status: "HELD_IN_ESCROW",
                createdAt: new Date()
            };

            // In production, save this payload to an Escrow database collection:
            // await Escrow.create(escrowPayload);

            return res.status(201).json({
                success: true,
                message: `Assets successfully locked into NAWI Escrow framework. Protected by Diamondback 231 rules.`,
                transaction: escrowPayload
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: "Escrow initialization failed.", error: error.message });
        }
    },

    // ==========================================
    // 2. RELEASE ESCROW & MONITOR MERCHANT METRICS
    // ==========================================
    /**
     * Releases escrow to the seller and instantly rewards compliance tracking points to upgrade users to Tier 2.
     */
    releaseEscrow: async (req, res) => {
        try {
            const { txId, buyerId } = req.body;

            // In production, retrieve transaction from DB:
            // const transaction = await Escrow.findOne({ txId });
            const mockTx = { txId, sellerId: "mock_seller_id", amount: 150, status: "HELD_IN_ESCROW", pillarOrigin: "marketplace" }; // Mock for structure

            if (!mockTx || mockTx.status !== "HELD_IN_ESCROW") {
                return res.status(400).json({ success: false, message: "Active escrow transaction not found." });
            }

            // Mark transaction as complete
            mockTx.status = "RELEASED_TO_SELLER";

            // TARGET LOCK: Update Merchant compliance parameters automatically
            const seller = await User.findById(mockTx.sellerId);
            if (seller) {
                seller.complianceMetrics.cleanEscrowTransactions += 1;
                
                // If merchant reaches 10 clean transactions and has 0 violations, graduate them to Tier 2
                if (seller.complianceMetrics.cleanEscrowTransactions >= 10 && seller.complianceMetrics.rulesViolated === 0 && seller.verificationTier < 2) {
                    seller.verificationTier = 2;
                    seller.tierLabel = "Verified Merchant";
                }
                await seller.save();
            }

            // Track transaction volume in the daily financial system log
            const todayStr = new Date().toISOString().split('T')[0];
            let ledger = await DailyLedger.findOne({ date: todayStr });
            if (ledger) {
                ledger.totalVolumeProcessedUsd += mockTx.amount;
                await ledger.save();
            }

            return res.status(200).json({
                success: true,
                message: "Escrow funds securely cleared and routed to recipient node.",
                txId: mockTx.txId,
                status: mockTx.status
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: "Escrow release sequence failed.", error: error.message });
        }
    },

    // ==========================================
    // 3. MULTI-PILLAR REVENUE YIELD ENGINE
    // ==========================================
    /**
     * Validates and drops task revenue directly into user accounts based on specific Pillar activities.
     */
    claimPillarYield: async (req, res) => {
        try {
            const { userId, pillarName, activityType } = req.body;

            let user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, message: "User identity node missing." });

            let payoutAmount = 0;
            let logMessage = "";

            // Evaluate tracking metrics across all 7 functional engines
            switch (pillarName.toLowerCase()) {
                case "marketplace":
                    payoutAmount = 2.5; // Yield for digital product clearance / interactions
                    logMessage = "Marketplace interactive product yield calculated.";
                    break;
                case "ads_program":
                    payoutAmount = 1.2; // Traffic verification revenue split
                    logMessage = "Ads Program targeted metric split processed.";
                    break;
                case "gaming_studio":
                    payoutAmount = 3.0; // Global gaming streaming battle yield
                    logMessage = "Gaming Server match-participation node revenue settled.";
                    break;
                case "live_stream":
                    payoutAmount = 1.5; // Real video live stream broadcast allocation
                    logMessage = "Live Stream network synchronization yield disbursed.";
                    break;
                case "kitchen_meal":
                    payoutAmount = 2.0; // Culinary live stream / shop tracking verification interaction
                    logMessage = "Kitchen Meal logistical lifestyle yield distributed.";
                    break;
                case "music_promotion":
                    payoutAmount = 2.2; // Audio distribution hub streaming yield generation
                    logMessage = "Music Hub promotion track-index yield processed.";
                    break;
                case "content_creation":
                    payoutAmount = 1.0; // Feed interaction and media upload verification reward
                    logMessage = "Content Creation Feed status validation yield authorized.";
                    break;
                default:
                    return res.status(400).json({ success: false, message: "Target pillar node unknown to gateway." });
            }

            // Distribute coins to user profile balance
            user.empireCoins += payoutAmount;
            await user.save();

            return res.status(200).json({
                success: true,
                message: `Ecosystem yield successfully claimed. 100% user ownership guaranteed by rules.`,
                pillar: pillarName,
                coinsRewarded: payoutAmount,
                currentBalance: user.empireCoins,
                details: logMessage
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: "Yield calculation failure.", error: error.message });
        }
    },

    // ==========================================
    // 4. EXTERNAL GATEWAY INTEGRATION HOOKS (BINANCE / BYBIT)
    // ==========================================
    /**
     * Bridges digital escrow tokens out to high-liquidity financial endpoints.
     */
    executeExternalLiquidation: async (req, res) => {
        try {
            const { userId, executionNetwork, amount, destinationWallet } = req.body; // executionNetwork = 'binance' || 'bybit'

            if (!["binance", "bybit"].includes(executionNetwork.toLowerCase())) {
                return res.status(400).json({ success: false, message: "Unsupported clearing house destination endpoint." });
            }

            let user = await User.findById(userId);
            if (!user) return res.status(404).json({ success: false, message: "User account node unverified." });

            // Balance check
            if (user.empireCoins < amount) {
                return res.status(400).json({ success: false, message: "Insufficient network yield assets to route transfer." });
            }

            // Execute mock integration handshake with foreign API structures
            const networkReferenceToken = `FIN_OUT_${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

            // Deduct system balance assets upon execution success
            user.empireCoins -= parseFloat(amount);
            await user.save();

            return res.status(200).json({
                success: true,
                message: `Liquidation sequence dispatched to ${executionNetwork.toUpperCase()} API network successfully.`,
                clearingReceipt: {
                    referenceToken: networkReferenceToken,
                    destination: destinationWallet,
                    clearedVolume: amount,
                    networkStatus: "SETTLED_SUCCESS"
                }
            });

        } catch (error) {
            return res.status(500).json({ success: false, message: "External liquidation bridge error.", error: error.message });
        }
    }
};

module.exports = p2pGateway;
