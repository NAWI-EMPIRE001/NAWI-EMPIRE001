// models/Notification.js

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({

    // Platform Watermark
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true
    },

    // Recipient
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Sender
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // Notification Type
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
            'WALLET_DEPOSIT',
            'WALLET_WITHDRAWAL',
            'SONIC_LEDGER',
            'SYSTEM'
        ],
        default: 'SYSTEM'
    },

    // Title
    title: {
        type: String,
        required: true
    },

    // Message
    message: {
        type: String,
        required: true
    },

    // Optional URL
    actionUrl: {
        type: String,
        default: ''
    },

    // Optional Post
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },

    // Optional Product
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },

    // Read Status
    read: {
        type: Boolean,
        default: false
    },

    // Priority
    priority: {
        type: String,
        enum: [
            'LOW',
            'NORMAL',
            'HIGH',
            'CRITICAL'
        ],
        default: 'NORMAL'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

},
{
    collection: 'notifications'
});

NotificationSchema.index({
    userId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    'Notification',
    NotificationSchema
); 
