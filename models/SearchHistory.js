// ======================================================
// NAWI-EMPIRE001 SEARCH HISTORY MODEL
// FILE: models/SearchHistory.js
// ======================================================

const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default:
            'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    query: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    category: {
        type: String,
        enum: [
            'USER',
            'PRODUCT',
            'STREAM',
            'POST',
            'MARKETPLACE',
            'MUSIC',
            'CHEF',
            'GENERAL'
        ],
        default: 'GENERAL'
    },

    resultsCount: {
        type: Number,
        default: 0
    },

    device: {
        type: String,
        default: 'UNKNOWN'
    },

    ipAddress: {
        type: String,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

}, {
    collection: 'search_histories'
});

SearchHistorySchema.index({
    user: 1,
    createdAt: -1
});

SearchHistorySchema.index({
    query: 'text'
});

module.exports = mongoose.model(
    'SearchHistory',
    SearchHistorySchema
);