// models/Escrow.js

const mongoose = require('mongoose');

const EscrowSchema = new mongoose.Schema({

    transactionId: {
        type: String,
        unique: true,
        required: true
    },

    buyerId: {
        type: String,
        required: true,
        index: true
    },

    sellerId: {
        type: String,
        required: true,
        index: true
    },

    productId: {
        type: String,
        default: null
    },

    description: {
        type: String,
        default: ''
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    currency: {
        type: String,
        default: 'EMPIRE_COINS'
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'HELD',
            'RELEASED',
            'DISPUTED',
            'REFUNDED',
            'CANCELLED'
        ],
        default: 'PENDING'
    },

    disputeReason: {
        type: String,
        default: ''
    },

    releasedAt: {
        type: Date,
        default: null
    },

    refundedAt: {
        type: Date,
        default: null
    },

    buyerConfirmation: {
        type: Boolean,
        default: false
    },

    sellerConfirmation: {
        type: Boolean,
        default: false
    },

    forensicStamp: {
        type: Boolean,
        default: true
    },

    escrowMetadata: {
        sourcePillar: {
            type: String,
            enum: [
                'THE_SOVEREIGN_EXCHANGE',
                'THE_DIAMONDBACK_FORGE',
                'THE_AESTHETIC_NEXUS',
                'THE_CULINARY_MATRIX',
                'GENERAL'
            ],
            default: 'GENERAL'
        },

        nodeAuthority: {
            type: String,
            default: 'NAWI-EMPIRE001'
        },

        trustProtocol: {
            type: String,
            default: 'DIAMONDBACK-231-ESCROW-SHIELD'
        }
    },

    auditTrail: [{
        action: String,
        actorId: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001'
    }

}, {
    timestamps: true,
    collection: 'escrows'
});

module.exports = mongoose.model('Escrow', EscrowSchema);
