const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    sessionToken: {
        type: String,
        required: true,
        unique: true
    },

    refreshToken: {
        type: String,
        default: null
    },

    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        default: null
    },

    ipAddress: String,

    userAgent: String,

    location: {
        country: String,
        city: String
    },

    isActive: {
        type: Boolean,
        default: true
    },

    lastActivity: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        required: true
    }

}, {
    timestamps: true,
    collection: 'user_sessions'
});

module.exports = mongoose.model(
    'UserSession',
    UserSessionSchema
);