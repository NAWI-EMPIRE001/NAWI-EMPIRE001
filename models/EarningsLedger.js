const mongoose = require('mongoose');

const EarningsLedgerSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    source: {
        type: String,
        required: true,
        enum: [
            'GIFT',
            'SALE',
            'STREAM',
            'BONUS_UNLOCK',
            'TASK_REWARD',
            'AD_SHARE'
        ]
    },

    amount: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'APPROVED',
            'PAID'
        ],
        default: 'APPROVED'
    },

    payoutEligible: {
        type: Boolean,
        default: true
    },

    reference: {
        type: String,
        default: () =>
            `ERN-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    }

}, {
    timestamps: true,
    collection: 'earnings_ledgers'
});

module.exports = mongoose.model(
    'EarningsLedger',
    EarningsLedgerSchema
);