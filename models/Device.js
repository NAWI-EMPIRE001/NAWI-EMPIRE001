const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    fingerprint: {
        type: String,
        required: true,
        unique: true
    },

    deviceName: String,

    platform: String,

    os: String,

    browser: String,

    ipAddress: String,

    trusted: {
        type: Boolean,
        default: false
    },

    lastSeen: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true,
    collection: 'devices'
});

module.exports = mongoose.model(
    'Device',
    DeviceSchema
);