// models/Follow.js

const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({

    // Platform Security Watermark
    platform_watermark: {
        type: String,
        default: "PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001",
        immutable: true
    },

    // User who follows
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // User being followed
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Follow status
    status: {
        type: String,
        enum: [
            'ACTIVE',
            'BLOCKED',
            'REMOVED'
        ],
        default: 'ACTIVE'
    },

    // Audit Information
    source_platform: {
        type: String,
        default: 'NAWI-EMPIRE'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

},
{
    collection: 'follows'
});

// Prevent duplicate follows
FollowSchema.index(
    {
        follower: 1,
        following: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    'Follow',
    FollowSchema
);
