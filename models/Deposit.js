const mongoose = require('mongoose');

const DepositSchema = new mongoose.Schema({

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

    paymentMethod: {
        type: String,
        enum: [
            'CARD',
            'BANK_TRANSFER',
            'CRYPTO',
            'MOBILE_MONEY'
        ],
        required: true
    },

    reference: {
        type: String,
        unique: true,
        required: true
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'SUCCESS',
            'FAILED'
        ],
        default: 'PENDING'
    },

    gatewayResponse: {
        type: Object,
        default: {}
    }

}, {
    timestamps: true,
    collection: 'deposits'
});

module.exports = mongoose.model(
    'Deposit',
    DepositSchema
);