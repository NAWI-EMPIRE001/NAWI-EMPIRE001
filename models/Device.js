const mongoose = require('mongoose');

const deviceSchema = new mongoose.schema({

    user: {
        type: mongoose.schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },

    fingerprint: {
        type: string,
        required: true,
        unique: true
    },

    deviceName: string,

    platform: string,

    os: string,

    browser: string,

    ipaddress: string,

    trusted: {
        type: boolean,
        default: false
    },

    lastSeen: {
        type: date,
        default: date.now
    }

}, {
    timestamps: true,
    collection: 'devices'
});

module.exports = mongoose.model(
    'device',
    deviceSchema
);