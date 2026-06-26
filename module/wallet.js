const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default:
            'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    coinBalance: {
        type: Number,
        default: 5,
        min: 0
    },

    escrowBalance: {
        type: Number,
        default: 0,
        min: 0
    },

    frozenBalance: {
        type: Number,
        default: 0,
        min: 0
    },

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

    walletStatus: {
        type: String,
        enum: [
            'ACTIVE',
            'FROZEN',
            'RESTRICTED'
        ],
        default: 'ACTIVE',
        index: true
    },

    pillarRevenue: {
        ARENA_NODE: { type: Number, default: 0 },
        SOVEREIGN_EXCHANGE: { type: Number, default: 0 },
        VISIBILITY_ENGINE: { type: Number, default: 0 },
        CULINARY_MATRIX: { type: Number, default: 0 },
        AESTHETIC_NEXUS: { type: Number, default: 0 },
        DIAMONDBACK_FORGE: { type: Number, default: 0 },
        SONIC_LEDGER: { type: Number, default: 0 }
    },

    transactionHistory: [
        {
            transactionId: {
                type: String,
                default: () =>
                    `TXN-${Date.now()}-${Math.floor(
                        1000 + Math.random() * 9000
                    )}`,
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

            sourcePillar: {
                type: String,
                default: 'GENERAL'
            },

            description: {
                type: String,
                default: ''
            },

            reference: {
                type: String,
                default: ''
            },

            status: {
                type: String,
                enum: [
                    'PENDING',
                    'VERIFIED',
                    'FAILED'
                ],
                default: 'VERIFIED'
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


// =====================================================
// VIRTUALS
// =====================================================

WalletSchema.virtual('availableBalance').get(function () {
    return Math.max(
        0,
        this.coinBalance - this.frozenBalance
    );
});


// =====================================================
// INTERNAL VALIDATOR
// =====================================================

WalletSchema.methods.validateAmount = function (amount) {

    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid transaction amount');
    }
};

WalletSchema.methods.assertActive = function () {

    if (this.walletStatus !== 'ACTIVE') {
        throw new Error(
            `Wallet is ${this.walletStatus}`
        );
    }
};


// =====================================================
// CREDIT
// =====================================================

WalletSchema.methods.credit = async function (
    amount,
    sourcePillar = 'GENERAL',
    description = ''
) {

    this.validateAmount(amount);
    this.assertActive();

    this.coinBalance += amount;
    this.totalEarned += amount;

    if (this.pillarRevenue[sourcePillar] !== undefined) {
        this.pillarRevenue[sourcePillar] += amount;
    }

    this.transactionHistory.push({
        type: 'DEPOSIT',
        amount,
        sourcePillar,
        description
    });

    return await this.save();
};


// =====================================================
// DEBIT
// =====================================================

WalletSchema.methods.debit = async function (
    amount,
    sourcePillar = 'GENERAL',
    description = ''
) {

    this.validateAmount(amount);
    this.assertActive();

    if (this.coinBalance < amount) {
        throw new Error('Insufficient balance');
    }

    this.coinBalance -= amount;

    this.transactionHistory.push({
        type: 'PURCHASE',
        amount,
        sourcePillar,
        description
    });

    return await this.save();
};


// =====================================================
// WITHDRAW
// =====================================================

WalletSchema.methods.withdraw = async function (
    amount,
    description = ''
) {

    this.validateAmount(amount);
    this.assertActive();

    if (this.coinBalance < amount) {
        throw new Error('Insufficient balance');
    }

    this.coinBalance -= amount;
    this.totalWithdrawn += amount;

    this.transactionHistory.push({
        type: 'WITHDRAWAL',
        amount,
        description
    });

    return await this.save();
};


// =====================================================
// ESCROW METHODS
// =====================================================

WalletSchema.methods.lockEscrow = async function (
    amount,
    sourcePillar = 'GENERAL'
) {

    this.validateAmount(amount);
    this.assertActive();

    if (this.coinBalance < amount) {
        throw new Error('Insufficient balance');
    }

    this.coinBalance -= amount;
    this.escrowBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_LOCK',
        amount,
        sourcePillar
    });

    return await this.save();
};

WalletSchema.methods.releaseEscrow = async function (
    amount,
    sourcePillar = 'GENERAL'
) {

    this.validateAmount(amount);

    if (this.escrowBalance < amount) {
        throw new Error(
            'Insufficient escrow balance'
        );
    }

    this.escrowBalance -= amount;
    this.coinBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_RELEASE',
        amount,
        sourcePillar
    });

    return await this.save();
};

WalletSchema.methods.refundEscrow = async function (
    amount,
    sourcePillar = 'GENERAL'
) {

    this.validateAmount(amount);

    if (this.escrowBalance < amount) {
        throw new Error(
            'Insufficient escrow balance'
        );
    }

    this.escrowBalance -= amount;
    this.coinBalance += amount;

    this.transactionHistory.push({
        type: 'ESCROW_REFUND',
        amount,
        sourcePillar
    });

    return await this.save();
};


// =====================================================
// ADMIN METHODS
// =====================================================

WalletSchema.methods.freezeWallet = async function () {

    this.walletStatus = 'FROZEN';

    return await this.save();
};

WalletSchema.methods.activateWallet = async function () {

    this.walletStatus = 'ACTIVE';

    return await this.save();
};


// =====================================================
// INDEXES
// =====================================================

WalletSchema.index({
    walletStatus: 1
});

WalletSchema.index({
    updatedAt: -1
});


// =====================================================
// EXPORTS
// =====================================================

const Wallet = mongoose.model(
    'Wallet',
    WalletSchema
);

module.exports = Wallet;