const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema(
{
    advertiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    image: {
        type: String,
        default: ''
    },

    video: {
        type: String,
        default: ''
    },

    targetUrl: {
        type: String,
        default: ''
    },

    category: {
        type: String,
        enum: [
            'general',
            'business',
            'marketplace',
            'services',
            'events'
        ],
        default: 'general'
    },

    status: {
        type: String,
        enum: [
            'pending',
            'approved',
            'rejected',
            'paused',
            'active',
            'expired'
        ],
        default: 'pending'
    },

    budget: {
        type: Number,
        default: 0
    },

    impressions: {
        type: Number,
        default: 0
    },

    clicks: {
        type: Number,
        default: 0
    },

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    'Advertisement',
    advertisementSchema
);
