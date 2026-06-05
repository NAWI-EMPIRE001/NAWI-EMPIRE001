// models/Gift.js

const mongoose = require('mongoose');

const GiftSchema = new mongoose.Schema({

    giftId: {
        type: String,
        unique: true,
        default: () => `GIFT-${Date.now()}-${Math.floor(Math.random() * 100000)}`
    },

    senderId: {
        type: String,
        required: true,
        index: true
    },

    receiverId: {
        type: String,
        required: true,
        index: true
    },

    giftName: {
        type: String,
        required: true,
        enum: [
            'SPARK',
            'DIAMOND',
            'EMPIRE',
            'TITAN',
            'SOVEREIGN'
        ]
    },

    giftValue: {
        type: Number,
        required: true,
        min: 1
    },

    empireCoins: {
        type: Number,
        required: true,
        min: 1
    },

    creatorReward: {
        type: Number,
        default: 0
    },

    platformFee: {
        type: Number,
        default: 0
    },

    rewardMultiplier: {
        type: Number,
        default: 0.02
    },

    streamId: {
        type: String,
        default: null
    },

    battleId: {
        type: String,
        default: null
    },

    pillarSource: {
        type: String,
        enum: [
            'THE_ARENA_NODE',
            'THE_SONIC_LEDGER',
            'THE_CULINARY_MATRIX',
            'THE_AESTHETIC_NEXUS',
            'GENERAL'
        ],
        default: 'GENERAL'
    },

    transactionStatus: {
        type: String,
        enum: [
            'PENDING',
            'COMPLETED',
            'FAILED',
            'REFUNDED'
        ],
        default: 'COMPLETED'
    },

    watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001'
    }

}, {
    timestamps: true,
    collection: 'gifts'
});

module.exports = mongoose.model('Gift', GiftSchema);
