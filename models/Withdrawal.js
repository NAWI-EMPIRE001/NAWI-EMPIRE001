const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: 'USD'
    },

    destination: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        walletAddress: String
    },

    method: {
        type: String,
        enum: [
            'BANK_TRANSFER',
            'CRYPTO',
            'MOBILE_MONEY'
        ],
        required: true
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'PROCESSING',
            'APPROVED',
            'REJECTED',
            'COMPLETED'
        ],
        default: 'PENDING'
    },

    complianceChecked: {
        type: Boolean,
        default: false
    },

    processedAt: Date

}, {
    timestamps: true,
    collection: 'withdrawals'
});

module.exports = mongoose.model(
    'Withdrawal',
    WithdrawalSchema
);