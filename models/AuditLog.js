const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({

    actor: {
        type: String,
        default: process.env.SYSTEM_ADMIN_ID ||
            'System_Admin_001'
    },

    action: {
        type: String,
        required: true
    },

    entity: {
        type: String,
        required: true
    },

    entityId: {
        type: mongoose.Schema.Types.Mixed
    },

    ipAddress: {
        type: String
    },

    userAgent: {
        type: String
    },

    metadata: {
        type: Object,
        default: {}
    },

    severity: {
        type: String,
        enum: [
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        ],
        default: 'LOW'
    }

}, {
    timestamps: true,
    collection: 'audit_logs'
});

module.exports = mongoose.model(
    'AuditLog',
    AuditLogSchema
);