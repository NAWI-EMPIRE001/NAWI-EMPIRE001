// models/Escrow.js

const mongoose = require('mongoose');

const EscrowSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    transactionId: {
        type: String,
        unique: true,
        required: true,
        index: true
    },

    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },

    relatedTransaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },

    amount: {
        type: Number,
        required: true,
        min: 1
    },

    currency: {
        type: String,
        default: 'EC'
    },

    description: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'HELD',
            'RELEASED',
            'DISPUTED',
            'REFUNDED',
            'CANCELLED',
            'UNDER_REVIEW'
        ],
        default: 'PENDING'
    },

    buyerConfirmation: {
        type: Boolean,
        default: false
    },

    sellerConfirmation: {
        type: Boolean,
        default: false
    },

    disputeReason: {
        type: String,
        default: ''
    },

    disputeOpenedAt: {
        type: Date
    },

    releasedAt: {
        type: Date
    },

    refundedAt: {
        type: Date
    },

    forensicStamp: {
        isForensicStamped: {
            type: Boolean,
            default: true
        },

        trustProtocol: {
            type: String,
            default: 'DIAMONDBACK-231-ESCROW-SHIELD'
        },

        assetFingerprint: {
            type: String,
            default: ''
        }
    },

    escrowMetadata: {

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

        nodeAuthority: {
            type: String,
            default: 'NAWI-EMPIRE001'
        }
    },

    auditTrail: [{
        action: {
            type: String
        },

        actorId: {
            type: String
        },

        notes: {
            type: String
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    }]

},
{
    collection: 'escrows',
    timestamps: true
});

module.exports = mongoose.model('Escrow', EscrowSchema);
