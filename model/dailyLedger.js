const mongoose = require('mongoose');

/**
 * =========================================================
 * NAWI-EMPIRE001 DAILY LEDGER
 * FINANCIAL RECONCILIATION & PLATFORM METRICS
 * =========================================================
 */

const DailyLedgerSchema = new mongoose.Schema({

    // =====================================================
    // DATE PARTITION (Enforced ISO Standard: YYYY-MM-DD)
    // =====================================================
    date: {
        type: String,
        required: true,
        unique: true,
        index: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },

    // =====================================================
    // PLATFORM VOLUME METRICS (Multi-Currency Framework)
    // =====================================================
    totalVolumeProcessedUsd: {
        type: Number,
        default: 0,
        min: 0
    },

    totalVolumeProcessedNaira: {
        type: Number,
        default: 0,
        min: 0
    },

    totalVolumeProcessedCoin: {
        type: Number,
        default: 0,
        min: 0
    },

    maxLimitCapUsd: {
        type: Number,
        default: 35000000,
        select: false
    },

    // =====================================================
    // TRANSACTION LIFE-CYCLE METRICS
    // =====================================================
    totalTransactions: { type: Number, default: 0 },
    successfulTransactions: { type: Number, default: 0 },
    failedTransactions: { type: Number, default: 0 },

    // =====================================================
    // ESCROW LIQUIDITY ENGINE METRICS
    // =====================================================
    totalEscrowTransactions: { type: Number, default: 0 },
    escrowVolume: { type: Number, default: 0 },
    escrowReleased: { type: Number, default: 0 },
    escrowRefunded: { type: Number, default: 0 },
    escrowDisputed: { type: Number, default: 0 },

    // =====================================================
    // THE 7 CORE ARCHITECTURAL PILLARS REVENUE MATRICES
    // =====================================================
    pillarRevenueBreakdown: {
        ARENA_NODE: { type: Number, default: 0 },
        SOVEREIGN_EXCHANGE: { type: Number, default: 0 },
        VISIBILITY_ENGINE: { type: Number, default: 0 },
        CULINARY_MATRIX: { type: Number, default: 0 },
        AESTHETIC_NEXUS: { type: Number, default: 0 },
        DIAMONDBACK_FORGE: { type: Number, default: 0 },
        SONIC_LEDGER: { type: Number, default: 0 }
    },

    // =====================================================
    // SYSTEM TRACKING
    // =====================================================
    totalMarketplaceSales: { type: Number, default: 0 },
    totalDeposits: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalCoinCirculation: { type: Number, default: 0 },

    // =====================================================
    // USER BASE GROWTH METRICS
    // =====================================================
    totalRegisteredUsers: { type: Number, default: 0 },
    totalVerifiedUsers: { type: Number, default: 0 },

    // =====================================================
    // RECONCILIATION ENGINE & RISK ARRAYS
    // =====================================================
    reconciliationStatus: {
        type: String,
        enum: ['PENDING', 'PASSED', 'FAILED'],
        default: 'PENDING'
    },

    anomalyCount: {
        type: Number,
        default: 0
    },

    anomalyLogs: [
        {
            type: { type: String, required: true }, // e.g., "ESCROW_MISMATCH", "REVENUE_VARIANCE"
            description: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],

    // =====================================================
    // SYSTEM CONTROL
    // =====================================================
    vaultStatus: {
        type: String,
        enum: ['ACTIVE', 'LOCKED', 'MAINTENANCE'],
        default: 'LOCKED'
    },

    // =====================================================
    // AUDIT INFORMATION
    // =====================================================
    lastAuditAt: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true,
    collection: 'daily_ledgers'
});


// =========================================================
// 🧠 AUTOMATED ATOMIC CONCURRENCY ENGINE
// =========================================================

/**
 * Native static tracker hook ensuring zero-race updates across ecosystem paths
 */
DailyLedgerSchema.statics.logSystemTransaction = async function (txnDetails) {
    const today = new Date().toISOString().split('T')[0];
    const { type, amount, currency, status, sourcePillar } = txnDetails;

    // Build standard atomic operations increment payload
    const incFields = { totalTransactions: 1 };

    if (status === 'VERIFIED' || status === 'SUCCESS') {
        incFields.successfulTransactions = 1;
        
        // Dynamic multi-currency tracking allocation
        if (currency === 'USD') incFields.totalVolumeProcessedUsd = amount;
        else if (currency === 'NGN') incFields.totalVolumeProcessedNaira = amount;
        else incFields.totalVolumeProcessedCoin = amount;

        // Dynamic Pillar attribution pipeline matching Wallet schema specifications
        if (sourcePillar && this.schema.path(`pillarRevenueBreakdown.${sourcePillar}`)) {
            incFields[`pillarRevenueBreakdown.${sourcePillar}`] = amount;
        }

        // Logic conditional updates mappings
        if (type === 'DEPOSIT') incFields.totalDeposits = amount;
        if (type === 'WITHDRAWAL') incFields.totalWithdrawals = amount;
        if (type === 'ESCROW_LOCK') {
            incFields.totalEscrowTransactions = 1;
            incFields.escrowVolume = amount;
        }
        if (type === 'ESCROW_RELEASE') incFields.escrowReleased = amount;
        if (type === 'ESCROW_REFUND') incFields.escrowRefunded = amount;
    } else if (status === 'FAILED') {
        incFields.failedTransactions = 1;
    }

    // Atomic Upsert execution context guarantees a ledger document always sits in readiness
    return await this.findOneAndUpdate(
        { date: today },
        { 
            $inc: incFields,
            $set: { vaultStatus: 'ACTIVE', lastAuditAt: new Date() }
        },
        { upsert: true, new: true, runValidators: true }
    );
};

module.exports = mongoose.model('DailyLedger', DailyLedgerSchema);
