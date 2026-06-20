const mongoose = require('mongoose');

/**
 * =========================================================
 * NAWI-EMPIRE001
 * FINANCIAL LEDGER ENGINE
 * DOUBLE-ENTRY ACCOUNTING CORE
 * =========================================================
 */

const LedgerEntrySchema = new mongoose.Schema({

    // =====================================================
    // PLATFORM WATERMARK
    // =====================================================
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    // =====================================================
    // UNIQUE ENTRY ID
    // =====================================================
    entryId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // =====================================================
    // RELATED TRANSACTION
    // =====================================================
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
        index: true
    },

    // =====================================================
    // OPTIONAL ESCROW LINK
    // =====================================================
    escrowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escrow'
    },

    // =====================================================
    // USER LINK
    // =====================================================
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // =====================================================
    // WALLET LINK
    // =====================================================
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },

    // =====================================================
    // ACCOUNT CATEGORY
    // =====================================================
    accountType: {
        type: String,
        enum: [
            'AVAILABLE',
            'ESCROW',
            'REVENUE',
            'WITHDRAWAL',
            'FEE',
            'DEPOSIT',
            'REFUND'
        ],
        required: true
    },

    // =====================================================
    // DOUBLE ENTRY SIDE
    // =====================================================
    entryType: {
        type: String,
        enum: [
            'DEBIT',
            'CREDIT'
        ],
        required: true
    },

    // =====================================================
    // FINANCIAL VALUE
    // =====================================================
    amount: {
        type: Number,
        required: true,
        min: 0
    },

    currency: {
        type: String,
        default: 'COIN',
        enum: [
            'COIN',
            'USD',
            'NGN'
        ]
    },

    // =====================================================
    // TRANSACTION CATEGORY
    // =====================================================
    transactionCategory: {
        type: String,
        enum: [
            'ESCROW_CREATE',
            'ESCROW_RELEASE',
            'ESCROW_REFUND',
            'DEPOSIT',
            'WITHDRAWAL',
            'PURCHASE',
            'SALE',
            'ROYALTY',
            'PAYOUT',
            'FEE'
        ],
        required: true
    },

    // =====================================================
    // NAWI PILLAR SOURCE
    // =====================================================
    sourcePillar: {
        type: String,
        enum: [
            'ARENA_NODE',
            'SOVEREIGN_EXCHANGE',
            'VISIBILITY_ENGINE',
            'CULINARY_MATRIX',
            'AESTHETIC_NEXUS',
            'DIAMONDBACK_FORGE',
            'SONIC_LEDGER',
            'GENERAL'
        ],
        default: 'GENERAL'
    },

    // =====================================================
    // STATUS
    // =====================================================
    status: {
        type: String,
        enum: [
            'PENDING',
            'COMPLETED',
            'FAILED',
            'REVERSED'
        ],
        default: 'COMPLETED'
    },

    // =====================================================
    // RECONCILIATION FLAG
    // =====================================================
    reconciled: {
        type: Boolean,
        default: false,
        index: true
    },

    reconciledAt: {
        type: Date
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================
    description: {
        type: String,
        trim: true
    },

    metadata: {
        type: Object,
        default: {}
    }

},
{
    timestamps: true,
    collection: 'ledger_entries'
});

// =========================================================
// INDEXES
// =========================================================

LedgerEntrySchema.index({
    user: 1,
    createdAt: -1
});

LedgerEntrySchema.index({
    transactionId: 1
});

LedgerEntrySchema.index({
    sourcePillar: 1
});

LedgerEntrySchema.index({
    reconciled: 1
});

module.exports = mongoose.model(
    'LedgerEntry',
    LedgerEntrySchema
);
