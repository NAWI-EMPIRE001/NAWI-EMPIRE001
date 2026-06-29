const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({

    eventType: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    pillar: {
        type: String,
        default: 'GENERAL'
    },

    metadata: {
        type: Object,
        default: {}
    },

    ipAddress: String,

    device: String,

    createdAt: {
        type: Date,
        default: Date.now
    }

},
{
    collection: 'analytics'
});

module.exports = mongoose.model(
    'Analytics',
    AnalyticsSchema
);