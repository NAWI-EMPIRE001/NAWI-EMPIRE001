const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    verificationLevel: {
        type: Number,
        default: 1
    },

    merchantVerified: {
        type: Boolean,
        default: false
    },

    businessVerified: {
        type: Boolean,
        default: false
    },

    biometricVerified: {
        type: Boolean,
        default: false
    },

    verificationType: {
        type: String,
        enum: [
            'identity',
            'business',
            'address',
            'phone',
            'email'
        ],
        default: 'identity'
    },

    fullName: String,

    documentType: {
        type: String,
        enum: [
            'national_id',
            'passport',
            'drivers_license',
            'voters_card',
            'business_registration'
        ]
    },

    documentNumber: String,

    frontImage: String,

    backImage: String,

    selfieImage: String,

    scamRiskScore: {
        type: Number,
        default: 0
    },

    sevenPillarAccess: {

        ARENA_NODE: {
            type: Boolean,
            default: true
        },

        SOVEREIGN_EXCHANGE: {
            type: Boolean,
            default: true
        },

        VISIBILITY_ENGINE: {
            type: Boolean,
            default: true
        },

        CULINARY_MATRIX: {
            type: Boolean,
            default: true
        },

        AESTHETIC_NEXUS: {
            type: Boolean,
            default: true
        },

        DIAMONDBACK_FORGE: {
            type: Boolean,
            default: true
        },

        SONIC_LEDGER: {
            type: Boolean,
            default: true
        }
    },

    status: {
        type: String,
        enum: [
            'pending',
            'under_review',
            'approved',
            'rejected'
        ],
        default: 'pending'
    },

    rejectionReason: {
        type: String,
        default: ''
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    reviewedAt: Date

},
{
    timestamps: true,
    collection: 'verifications'
});

module.exports = mongoose.model(
    'Verification',
    VerificationSchema
);
