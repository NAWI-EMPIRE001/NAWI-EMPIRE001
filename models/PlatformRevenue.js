// ======================================================
// NAWI-EMPIRE001
// FILE: models/PlatformRevenue.js
// PURPOSE:
// Isolated operational revenue pool.
// NEVER connected to reserve liquidity systems.
// ======================================================

const mongoose = require('mongoose');

const PlatformRevenueSchema = new mongoose.Schema(
    {
        platform_watermark: {
            type: String,
            default:
                'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
            immutable: true
        },

        revenueType: {
            type: String,
            enum: [
                'OPERATIONS',
                'MARKETPLACE_FEES',
                'ADVERTISEMENT_FEES',
                'STREAMING_FEES',
                'ESCROW_FEES',
                'SUBSCRIPTIONS',
                'OTHER'
            ],
            default: 'OPERATIONS',
            required: true,
            unique: true,
            index: true
        },

        currency: {
            type: String,
            default: 'USD'
        },

        // Total funds ever received
        totalDeposits: {
            type: Number,
            default: 0,
            min: 0
        },

        // Total withdrawals paid to users
        totalPayouts: {
            type: Number,
            default: 0,
            min: 0
        },

        // Current usable balance
        availableBalance: {
            type: Number,
            default: 0,
            min: 0
        },

        // Optional accounting records
        transactionHistory: [
            {
                reference: String,

                type: {
                    type: String,
                    enum: [
                        'CREDIT',
                        'DEBIT'
                    ]
                },

                amount: {
                    type: Number,
                    min: 0
                },

                description: String,

                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true,
        collection: 'platformrevenues'
    }
);

// ======================================================
// INSTANCE METHODS
// ======================================================

PlatformRevenueSchema.methods.credit = async function (
    amount,
    description = ''
) {
    this.totalDeposits += amount;
    this.availableBalance += amount;

    this.transactionHistory.push({
        type: 'CREDIT',
        amount,
        description
    });

    return this.save();
};

PlatformRevenueSchema.methods.debit = async function (
    amount,
    description = ''
) {
    if (this.availableBalance < amount) {
        throw new Error(
            'Insufficient operational revenue balance'
        );
    }

    this.availableBalance -= amount;
    this.totalPayouts += amount;

    this.transactionHistory.push({
        type: 'DEBIT',
        amount,
        description
    });

    return this.save();
};

module.exports = mongoose.model(
    'PlatformRevenue',
    PlatformRevenueSchema
);