 // ======================================================
// NAWI-EMPIRE001 NOTIFICATION MODEL
// FILE: models/Notification.js
// ======================================================

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
{
    // ==================================================
    // PLATFORM WATERMARK
    // ==================================================
    platformWatermark: {
        type: String,
        default:
            'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    // ==================================================
    // RECIPIENT
    // ==================================================
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // ==================================================
    // OPTIONAL SENDER
    // ==================================================
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // ==================================================
    // TYPE
    // ==================================================
    type: {
        type: String,
        enum: [
            'FOLLOW',
            'LIKE',
            'COMMENT',
            'POST',
            'LIVE_STREAM',
            'MARKETPLACE',
            'PURCHASE',
            'ESCROW',
            'WALLET_DEPOSIT',
            'WALLET_WITHDRAWAL',
            'VERIFICATION',
            'SONIC_LEDGER',
            'SYSTEM'
        ],
        default: 'SYSTEM'
    },

    // ==================================================
    // ORIGINATING PILLAR
    // ==================================================
    pillar: {
        type: String,
        enum: [
            'CORE',
            'ARENA_NODE',
            'SOVEREIGN_EXCHANGE',
            'VISIBILITY_ENGINE',
            'CULINARY_MATRIX',
            'AESTHETIC_NEXUS',
            'DIAMONDBACK_FORGE',
            'SONIC_LEDGER'
        ],
        default: 'CORE'
    },

    // ==================================================
    // CONTENT
    // ==================================================
    title: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    // ==================================================
    // OPTIONAL ACTION LINK
    // ==================================================
    actionUrl: {
        type: String,
        default: ''
    },

    // ==================================================
    // RELATED REFERENCES
    // ==================================================
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },

    // ==================================================
    // FLEXIBLE PAYLOAD
    // ==================================================
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // ==================================================
    // READ STATUS
    // ==================================================
    read: {
        type: Boolean,
        default: false
    },

    readAt: {
        type: Date,
        default: null
    },

    // ==================================================
    // PRIORITY
    // ==================================================
    priority: {
        type: String,
        enum: [
            'LOW',
            'NORMAL',
            'HIGH',
            'CRITICAL'
        ],
        default: 'NORMAL'
    }

},
{
    timestamps: true,
    collection: 'notifications'
}
);

// ======================================================
// INDEXES
// ======================================================

NotificationSchema.index({
    userId: 1,
    createdAt: -1
});

NotificationSchema.index({
    read: 1
});

NotificationSchema.index({
    pillar: 1
});

NotificationSchema.index({
    type: 1
});

// ======================================================
// EXPORT MODEL
// ======================================================

module.exports = mongoose.model(
    'Notification',
    NotificationSchema
);