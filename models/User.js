const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    userId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: [
            'citizen',
            'verified',
            'moderator',
            'admin',
            'founder',
            'super_admin'
        ],
        default: 'citizen'
    },

    accountStatus: {
        type: String,
        enum: [
            'active',
            'pending',
            'suspended',
            'banned'
        ],
        default: 'active'
    },

    profilePhoto: {
        type: String,
        default: ''
    },

    identity: {
        sovereign_name: {
            type: String,
            default: 'Username'
        },

        legacy_rank: {
            type: String,
            default: 'Citizen'
        },

        id_verified: {
            type: Boolean,
            default: false
        },

        joined_date: {
            type: Date,
            default: Date.now
        }
    },

    metrics: {
        follower_count: {
            type: Number,
            default: 0
        },

        following_count: {
            type: Number,
            default: 0
        },

        daily_streak: {
            type: Number,
            default: 0
        },

        activity_score: {
            type: Number,
            default: 0
        }
    },

    eligibility: {
        can_go_live: {
            type: Boolean,
            default: false
        },

        is_monetized: {
            type: Boolean,
            default: false
        },

        gate_1k_reached: {
            type: Boolean,
            default: false
        },

        gate_20k_reached: {
            type: Boolean,
            default: false
        }
    },

    walletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Wallet'
    },

    verificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Verification'
    },

    advertisements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Advertisement'
    }],

    escrows: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Escrow'
    }],

    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],

    security: {
        is_banned: {
            type: Boolean,
            default: false
        },

        scam_alert_flag: {
            type: Number,
            default: 0
        },

        multi_factor_auth: {
            type: String,
            default: 'ENABLED'
        }
    }
},
{
    collection: 'users',
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
