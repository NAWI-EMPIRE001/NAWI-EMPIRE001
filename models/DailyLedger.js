const mongoose = require('mongoose');

const DailyLedgerSchema = new mongoose.Schema(
{
    date: {
        type: String,
        required: true,
        unique: true
    },

    totalVolumeProcessedUsd: {
        type: Number,
        default: 0
    },

    maxLimitCapUsd: {
        type: Number,
        default: 35000000,
        select: false
    },

    totalEscrowTransactions: {
        type: Number,
        default: 0
    },

    totalMarketplaceSales: {
        type: Number,
        default: 0
    },

    totalCoinCirculation: {
        type: Number,
        default: 0
    },

    totalRegisteredUsers: {
        type: Number,
        default: 0
    },

    totalVerifiedUsers: {
        type: Number,
        default: 0
    },

    vaultStatus: {
        type: String,
        enum: [
            'ACTIVE',
            'LOCKED',
            'MAINTENANCE'
        ],
        default: 'LOCKED'
    },

    lastAuditAt: {
        type: Date,
        default: Date.now
    }

},
{
    timestamps: true
});

module.exports = mongoose.model(
    'DailyLedger',
    DailyLedgerSchema
);
