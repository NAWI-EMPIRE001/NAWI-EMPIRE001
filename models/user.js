/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: models/user.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Description: Fully optimized, production-grade User infrastructure model. Features automated 
 * instance decryption methods, lifecycle pre-save hooks, strict E.164 tracking, and data leak protection.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
{
    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    userId: {
        type: String,
        required: true,
        unique: true,
        default: () => crypto.randomUUID()
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: value => value.toLowerCase().trim(), // ⚡ Pre-validation processing guard
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid, secure email address']
    },

    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8, // 🔒 Enforced strict length boundary
        select: false 
    },

    // Unified fields supporting legacy and new formats
    phone: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{6,14}$/, 'Please provide a valid international phone number format'],
        default: ''
    },
    
    phone_number: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{6,14}$/, 'Please provide a valid international phone number format'],
        default: ''
    },

    profilePhoto: {
        type: String,
        default: ''
    },

    verified: {
        type: Boolean,
        default: false
    },

    verifiedAt: {
        type: Date
    },

    role: {
        type: String,
        enum: [
            'citizen',
            'user',
            'verified',
            'creator',
            'moderator',
            'admin',
            'founder',
            'super_admin'
        ],
        default: 'user'
    },

    accountStatus: {
        type: String,
        enum: ['active', 'pending', 'suspended', 'banned'],
        default: 'active'
    },

    // Retained dual-tracking options to prevent route breaking
    verificationTier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

    current_tier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

    // ==========================================
    // IDENTITY & LEGISLATIVE RANK METRICS
    // ==========================================
    identity: {
        sovereign_name: {
            type: String,
            default: 'Authenticated Citizen'
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

    // ==========================================
    // BIOMETRIC AND VERIFICATION METRICS (TIER 1/3)
    // ==========================================
    biometricVerification: {
        day1VideoUrl: {
            type: String,
            default: ''
        },
        verifiedAt: {
            type: Date
        },
        biometricStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },

    verification_metrics: {
        day_1_video_url: {
            type: String,
            default: ''
        },
        corporate_docs_submitted: {
            type: Boolean,
            default: false
        },
        businessName: {
            type: String,
            default: ''
        },
        cacNumber: {
            type: String,
            default: ''
        },
        secure_docs_url: {
            type: String,
            default: ''
        }
    },

    businessVerification: {
        businessName: {
            type: String,
            default: ''
        },
        registrationNumber: {
            type: String,
            default: ''
        },
        registrationDocument: {
            type: String,
            default: ''
        },
        approved: {
            type: Boolean,
            default: false
        }
    },

    // ==========================================
    // ESCROW COMPLIANCE TRACKING LOGS
    // ==========================================
    complianceMetrics: {
        cleanEscrowTransactions: {
            type: Number,
            default: 0
        },
        rulesViolated: {
            type: Number,
            default: 0
        },
        successfulDeliveries: {
            type: Number,
            default: 0
        },
        disputesOpened: {
            type: Number,
            default: 0
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

    // ==========================================
    // THE 7 PILLARS ACCESS GATEWAYS
    // ==========================================
    pillarAccess: {
        marketplace: {
            type: Boolean,
            default: true
        },
        ads_program: {
            type: Boolean,
            default: true
        },
        gaming_studio: {
            type: Boolean,
            default: true
        },
        live_stream: {
            type: Boolean,
            default: true
        },
        kitchen_meal: {
            type: Boolean,
            default: true
        },
        music_promotion: {
            type: Boolean,
            default: true
        },
        content_creation: {
            type: Boolean,
            default: true
        }
    },

    // ==========================================
    // EMPIRE WALLET LEDGER
    // ==========================================
    wallet: {
        empire_coins: {
            type: Number,
            default: 5
        },
        total_earned_to_date: {
            type: Number,
            default: 0
        },
        pending_conversion: {
            type: Number,
            default: 0
        },
        usdBalance: {
            type: Number,
            default: 0
        },
        ngnBalance: {
            type: Number,
            default: 0
        }
    },

    // ==========================================
    // SOVEREIGN STYLIST STYLING RULES
    // ==========================================
    sovereignStylistTheme: {
        activeTheme: {
            type: String,
            enum: ['deep_obsidian', 'industrial_titanium', 'polished_gold'],
            default: 'deep_obsidian'
        },
        titaniumAccents: {
            type: Boolean,
            default: true
        },
        polishedGoldBorders: {
            type: Boolean,
            default: true
        }
    },

    challengesEntered: [{ type: String }],

    backupCodes: [
        {
            codeHash: { type: String },
            createdAt: { type: Date, default: Date.now },
            used: { type: Boolean, default: false }
        }
    ],

    // ==========================================
    // SYSTEM REF ACCESS POINTERS
    // ==========================================
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' },
    verificationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' },
    advertisements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' }],
    escrows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Escrow' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],

    security: {
        is_banned: { type: Boolean, default: false },
        scam_alert_flag: { type: Number, default: 0 },
        multi_factor_auth: { type: String, default: 'ENABLED' },
        lastLoginAt: { type: Date },
        lastLogoutAt: { type: Date },
        lastLoginIp: { type: String }
    },

    // Administrative Recovery & Soft Deletes
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }
},
{
    collection: 'users',
    timestamps: true
});

// =========================================================
// PERFORMANCE LOGICAL SUB-INDEX ARRAYS
// =========================================================
UserSchema.index({ isDeleted: 1 }); // ⚡ Optimized for high-frequency live soft-delete application state checks

// =========================================================
// VIRTUAL PRIMARY KEY MAPPING PATTERNS
// =========================================================
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// =========================================================
// DATA LEAK PLUGINS & RESPONSE FORMATTING TRANSFORMS
// =========================================================
const sanitizeTransform = {
    virtuals: true,
    transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.backupCodes;
        delete ret.platform_watermark; 
        return ret;
    }
};

UserSchema.set('toJSON', sanitizeTransform);
UserSchema.set('toObject', sanitizeTransform); // Synchronized execution parameters mapped across both data states

// =========================================================
// ENCAPSULATED MODEL INSTANCE INTERNET ACCESS METHODS
// =========================================================
UserSchema.methods.comparePassword = async function (candidatePassword) {
    // Standard secure encapsulation architecture
    return bcrypt.compare(candidatePassword, this.password);
};

// =========================================================
// AUTO-ENCRYPTION SECURITY MIDDLEWARE LAYER
// =========================================================
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// =========================================================
// INTERCEPT SYNCHRONIZATION MATRIX PROXY LAYER
// =========================================================
UserSchema.pre('save', function (next) {
    // Sync Phone Fields safely
    if (this.isModified('phone_number')) {
        this.phone = this.phone_number;
    } else if (this.isModified('phone')) {
        this.phone_number = this.phone;
    }

    // Sync Verification Tiers safely
    if (this.isModified('current_tier')) {
        this.verificationTier = this.current_tier;
    } else if (this.isModified('verificationTier')) {
        this.current_tier = this.verificationTier;
    }
    
    // Sync Biometric Video Links with explicit structural validation
    if (this.verification_metrics && this.biometricVerification) {
        if (this.isModified('verification_metrics.day_1_video_url')) {
            this.biometricVerification.day1VideoUrl = this.verification_metrics.day_1_video_url;
        }
        if (this.isModified('biometricVerification.day1VideoUrl')) {
            this.verification_metrics.day_1_video_url = this.biometricVerification.day1VideoUrl;
        }
    }

    // Sync Business Documentation parameters safely
    if (this.verification_metrics && this.businessVerification) {
        if (this.isModified('verification_metrics.businessName')) {
            this.businessVerification.businessName = this.verification_metrics.businessName;
        }
        if (this.isModified('verification_metrics.cacNumber')) {
            this.businessVerification.registrationNumber = this.verification_metrics.cacNumber;
        }
        if (this.isModified('verification_metrics.secure_docs_url')) {
            this.businessVerification.registrationDocument = this.verification_metrics.secure_docs_url;
        }
    }

    next();
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
