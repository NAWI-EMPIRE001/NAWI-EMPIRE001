// ======================================================
// NAWI-EMPIRE001 REPORT & MODERATION MODEL
// FILE: models/Report.js
// ======================================================

const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default:
            'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default: null
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        default: null
    },

    stream: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stream',
        default: null
    },

    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        default: null
    },

    reason: {
        type: String,
        enum: [
            'SPAM',
            'FRAUD',
            'HARASSMENT',
            'COPYRIGHT',
            'SCAM',
            'FAKE_PRODUCT',
            'VIOLENCE',
            'NUDITY',
            'MISINFORMATION',
            'OTHER'
        ],
        required: true
    },

    description: {
        type: String,
        maxlength: 1000
    },

    evidence: [{
        type: String
    }],

    priority: {
        type: String,
        enum: [
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        ],
        default: 'MEDIUM'
    },

    status: {
        type: String,
        enum: [
            'PENDING',
            'UNDER_REVIEW',
            'RESOLVED',
            'REJECTED'
        ],
        default: 'PENDING'
    },

    moderator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    resolutionNote: {
        type: String,
        default: ''
    },

    resolvedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true,
    collection: 'reports'
});

ReportSchema.index({
    reporter: 1,
    createdAt: -1
});

ReportSchema.index({
    status: 1,
    priority: 1
});

module.exports = mongoose.model(
    'Report',
    ReportSchema
);