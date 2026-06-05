const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    coinBalance: {
        type: Number,
        default: 5,
        min: 0
    },

    escrowBalance: {
        type: Number,
        default: 0
    },

    frozenBalance: {
        type: Number,
        default: 0
    },

    usdBalance: {
        type: Number,
        default: 0
    },

    nairaBalance: {
        type: Number,
        default: 0
    },

    totalEarned: {
        type: Number,
        default: 0
    },

    totalWithdrawn: {
        type: Number,
        default: 0
    },

    walletStatus: {
        type: String,
        enum: [
            'ACTIVE',
            'FROZEN',
            'RESTRICTED'
        ],
        default: 'ACTIVE'
    },

    pillarRevenue: {

        ARENA_NODE: {
            type: Number,
            default: 0
        },

        SOVEREIGN_EXCHANGE: {
            type: Number,
            default: 0
        },

        VISIBILITY_ENGINE: {
            type: Number,
            default: 0
        },

        CULINARY_MATRIX: {
            type: Number,
            default: 0
        },

        AESTHETIC_NEXUS: {
            type: Number,
            default: 0
        },

        DIAMONDBACK_FORGE: {
            type: Number,
            default: 0
        },

        SONIC_LEDGER: {
            type: Number,
            default: 0
        }
    },

    transactionHistory: [{

        transactionId: String,

        type: {
            type: String,
            enum: [
                'DEPOSIT',
                'WITHDRAWAL',
                'ESCROW',
                'REFUND',
                'ADVERTISEMENT',
                'ROYALTY',
                'PURCHASE'
            ]
        },

        amount: Number,

        currency: String,

        status: {
            type: String,
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
    }]
},
{
    timestamps: true,
    collection: 'wallets'
});

module.exports = mongoose.model(
    'Wallet',
    WalletSchema
);
