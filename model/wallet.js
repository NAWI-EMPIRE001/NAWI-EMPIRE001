const mongoose = require('mongoose');

/**
 * =========================================================
 * NAWI-EMPIRE001 - UNIFIED WALLET CORE SYSTEM
 * FINTECH-GRADE BALANCE + ESCROW ENGINE
 * =========================================================
 */

const WalletSchema = new mongoose.Schema({

    // =========================
    // PLATFORM LOCK
    // =========================
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    // =========================
    // OWNER LINK
    // =========================
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // =========================
    // CORE LIQUID BALANCE
    // =========================
    coinBalance: {
        type: Number,
        default: 5,
        min: 0,
        set: v => Math.max(0, v) // Prevents negative injection attacks
    },

    // =========================
    // ESCROW LOCKED FUNDS
    // =========================
    escrowBalance: {
        type: Number,
        default: 0,
        min: 0,
        set: v => Math.max(0, v)
    },

    // =========================
    // RISK CONTROL BALANCE
    // =========================
    frozenBalance: {
        type: Number,
        default: 0,
        min: 0
    },

    // =========================
    // MULTI-CURRENCY EXTENSION LAYER
    // =========================
    usdBalance: {
        type: Number,
        default: 0,
        min: 0
    },

    nairaBalance: {
        type: Number,
        default: 0,
        min: 0
    },

    // =========================
    // FINANCIAL TRACKING
    // =========================
    totalEarned: {
        type: Number,
        default: 0,
        min: 0
    },

    totalWithdrawn: {
        type: Number,
        default: 0,
        min: 0
    },

    // =========================
    // SYSTEM STATUS CONTROL
    // =========================
    walletStatus: {
        type: String,
        enum: ['ACTIVE', 'FROZEN', 'RESTRICTED'],
        default: 'ACTIVE',
        index: true
    },

    // =========================
    // PILLAR REVENUE TRACKING
    // =========================
    pillarRevenue: {
        ARENA_NODE: { type: Number, default: 0 },
        SOVEREIGN_EXCHANGE: { type: Number, default: 0 },
        VISIBILITY_ENGINE: { type: Number, default: 0 },
        CULINARY_MATRIX: { type: Number, default: 0 },
        AESTHETIC_NEXUS: { type: Number, default: 0 },
        DIAMONDBACK_FORGE: { type: Number, default: 0 },
        SONIC_LEDGER: { type: Number, default: 0 }
    },

    // =========================
    // TRANSACTION HISTORY
    // =========================
    transactionHistory: [
        {
            transactionId: {
                type: String,
                default: () => `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                index: true
            },

            type: {
                type: String,
                enum: [
                    'DEPOSIT',
                    'WITHDRAWAL',
                    'ESCROW_LOCK',
                    'ESCROW_RELEASE',
                    'ESCROW_REFUND',
                    'PURCHASE'
                ],
                required: true
            },

            amount: {
                type: Number,
                required: true,
                min: 0
            },

            currency: {
                type: String,
                default: 'COIN'
            },

            status: {
                type: String,
                enum: ['PENDING', 'VERIFIED', 'FAILED'],
                default: 'VERIFIED'
            },

            sourcePillar: {
                type: String,
                default: 'GENERAL'
            },

            timestamp: {
                type: Date,
                default: Date.now
            }
        }
    ]

}, {
    timestamps: true,
    collection: 'wallets'
});


// =========================================================
// 🧠 WALLET CORE ACTION HOOKS (AUTOMATED HISTORY ENGINE)
// =========================================================

/**
 * Guard check helper to ensure operational integrity
 */
WalletSchema.methods.assertActive = function () {
    if (this.walletStatus !== 'ACTIVE') {
        throw new Error(`Transaction blocked: Wallet is current ${this.walletStatus}`);
    }
};

/**
 * SAFE DEBIT (coinBalance)
 */
WalletSchema.methods.debit = async function (amount, sourcePillar = 'GENERAL') {
    this.assertActive();
    if (this.coinBalance < amount) throw new Error('Insufficient coin balance');

    this.coinBalance -= amount;

    // Fixed: Now automatically appends history directly on action Execution
    this.transactionHistory.push({
        type: 'PURCHASE',
        amount: amount,
        sourcePillar: sourcePillar
    });

    return await this.save();
};

/**
 * SAFE CREDIT (coinBalance)
 */
WalletSchema.methods.credit = async function (amount, sourcePillar = 'GENERAL') {
    this.assertActive();
    
    this.coinBalance += amount;
    this.totalEarned += amount;

    // Accumulate metrics if sourced from a designated Architectural Pillar
    if (this.pillarRevenue[sourcePillar] !== undefined) {
        this.pillarRevenue[sourcePillar] += amount;
    }

    this.transactionHistory.push({
        type: 'DEPOSIT',
        amount: amount,
        sourcePillar: sourcePillar
    });

    return await this.save();
};

/**
 * LOCK INTO ESCROW
 */
WalletSchema.methods.lockEscrow = async function (amount, sourcePillar = 'GENERAL') {
    this.assertActive();
    if (this.coinBalance < amount) throw new Error('Insufficient balance for escrow');

    this.coinBalance -= amount;
    this.escrowBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_LOCK',
        amount: amount,
        sourcePillar: sourcePillar
    });

    return await this.save();
};

/**
 * RELEASE FROM ESCROW TO WALLET
 */
WalletSchema.methods.releaseEscrow = async function (amount, sourcePillar = 'GENERAL') {
    // Escrow releases are allowed even during restriction to clear pending allocations safely
    if (this.escrowBalance < amount) throw new Error('Insufficient escrow balance');

    this.escrowBalance -= amount;
    this.coinBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_RELEASE',
        amount: amount,
        sourcePillar: sourcePillar
    });

    return await this.save();
};

/**
 * REFUND FROM ESCROW
 */
WalletSchema.methods.refundEscrow = async function (amount, sourcePillar = 'GENERAL') {
    if (this.escrowBalance < amount) {
        this.escrowBalance = 0; // Guard clause fallback
    } else {
        this.escrowBalance -= amount;
    }

    this.coinBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_REFUND',
        amount: amount,
        sourcePillar: sourcePillar
    });

    return await this.save();
};


// =========================================================
// 🚀 BACKWARD COMPATIBILITY & DUAL-EXPORT LAYER
// =========================================================
const Wallet = mongoose.model('Wallet', WalletSchema);

// This bridges legacy style calls: creditWallet(wallet, amount) -> wallet.credit(amount)
const legacyControllerBridge = {
    Wallet,
    debitWallet: async (walletInstance, amount) => await walletInstance.debit(amount),
    creditWallet: async (walletInstance, amount) => await walletInstance.credit(amount),
    lockEscrow: async (walletInstance, amount) => await walletInstance.lockEscrow(amount),
    releaseEscrow: async (walletInstance, amount) => await walletInstance.releaseEscrow(amount),
    refundEscrow: async (walletInstance, amount) => await walletInstance.refundEscrow(amount)
};

module.exports = legacyControllerBridge;
