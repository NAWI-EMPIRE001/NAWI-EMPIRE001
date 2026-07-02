/**
 * NAWI-EMPIRE001 Core Infrastructure
 * models/user.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Production-grade MongoDB Schema definition for the core User node.
 * Hardened with hot-reload safety parameters, automated index trees, explicit UI theme enums, and unified double-pass serialization transforms.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // 🟢 CRITICAL FIXED: Fully migrated to pure JS engine to eliminate Render compilation failure trees
const validator = require('validator');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    // ==========================================
    // 🏛️ CORE IDENTIFIERS & CREDENTIALS
    // ==========================================
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => `NW-${uuidv4().split('-')[0].toUpperCase()}` // Generates high-velocity sovereign anchor string
    },
    username: {
        type: String,
        required: [true, 'Username anchor point is required.'],
        unique: true,
        trim: true,
        minlength: [3, 'username must contain at least 3 characters.']
    },
    email: {
        type: String,
        required: [true, 'Email anchor point is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        set: value => typeof value === 'string' ? value.toLowerCase().trim() : value, // 🟢 OPTIMIZED: Normalizes value trends cleanly ahead of data evaluation blocks
        validate: [validator.isEmail, 'Please provide a valid electronic mail routing path.']
    },
    password: {
        type: String,
        required: [true, 'Secure password hash initialization target is required.'],
        minlength: [8, 'Password structure must hold a minimum of 8 characters.'],
        select: false // Strict isolation shield: Hides payload unless explicitly queried via .select('+password')
    },
    phone_number: {
        type: String,
        required: [true, 'Mobile validation tracking point is required.'],
        unique: true, // 🟢 OPTIMIZED: Mitigates account collision vectors and duplicate contact registry bugs
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },

    // ==========================================
    // ⚔️ ACCOUNT STATUS & SYSTEM RANK MATRICES
    // ==========================================
    role: {
        type: String,
        enum: ['user', 'merchant', 'admin', 'sovereign'],
        default: 'user'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'under_review', 'suspended', 'banned'],
        default: 'active'
    },
    current_tier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },
    verificationTier: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },
    verified: {
        type: Boolean,
        default: true
    },

    // ==========================================
    // 🛡️ SUB-DOCUMENT EMBEDDED INTERFACES
    // ==========================================
    identity: {
        sovereign_name: { type: String, default: '' },
        legacy_rank: { type: String, default: 'Citizen' },
        id_verified: { type: Boolean, default: true },
        joined_date: { type: Date, default: Date.now }
    },

    verification_metrics: {
        day_1_video_url: { type: String, default: '' },
        corporate_docs_submitted: { type: Boolean, default: false },
        businessName: { type: String, default: '' },
        cacNumber: { type: String, default: '' },
        secure_docs_url: { type: String, default: '' }
    },

    pillarAccess: {
        marketplace: { type: Boolean, default: true },
        ads_program: { type: Boolean, default: true },
        gaming_studio: { type: Boolean, default: true },
        live_stream: { type: Boolean, default: true },
        kitchen_meal: { type: Boolean, default: true },
        music_promotion: { type: Boolean, default: true },
        content_creation: { type: Boolean, default: true }
    },

    sovereignStylistTheme: {
        activeTheme: { 
            type: String, 
            enum: ['deep_obsidian', 'industrial_titanium', 'polished_gold'], 
            default: 'deep_obsidian' 
        },
        titaniumAccents: { type: Boolean, default: true },
        polishedGoldBorders: { type: Boolean, default: true }
    },

    wallet: {
        empire_coins: { type: Number, default: 5 },
        total_earned_to_date: { type: Number, default: 0 },
        pending_conversion: { type: Number, default: 0 },
        usdBalance: { type: Number, default: 0 },
        ngnBalance: { type: Number, default: 0 }
    },

    security: {
        lastLoginAt: { type: Date },
        lastLoginIp: { type: String, default: '' },
        compliance_violations: { type: Number, default: 0 },
        recovery_otp_hash: { type: String, default: null },
        recovery_otp_expires: { type: Date, default: null }
    }
}, {
    collection: 'users', 
    timestamps: true,
    toJSON: { 
        virtuals: true,
        transform(doc, ret) {
            delete ret.password; // 🟢 OPTIMIZED: Defensive isolation shield over network payloads
            delete ret.__v; 
            return ret;
        }
    },
    toObject: { 
        virtuals: true,
        transform(doc, ret) {
            delete ret.password; // 🟢 OPTIMIZED: Unified security layer during lean object conversions
            delete ret.__v; 
            return ret;
        }
    }
});

// =========================================================
// 🗂️ PERFORMANCE OPTIMIZATION INDEX TARGETS
// =========================================================
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ userId: 1 });
userSchema.index({ phone_number: 1 }); // 🟢 OPTIMIZED: Explicit tracking entry locks visual architectural consistency

// =========================================================
// 💎 FRONTEND VIRTUAL PATHWAY BINDINGS
// =========================================================
userSchema.virtual('id').get(function () {
    return this._id.toHexString(); 
});

// =========================================================
// ⚡ PRE-SAVE AUTOMATED CRYPTOGRAPHIC HASHING ENGINE
// =========================================================
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// =========================================================
// 🔄 PRE-SAVE STRUCTURAL DATA SYNCHRONIZATION HOOK
// =========================================================
userSchema.pre('save', function (next) {
    if (this.phone_number && !this.phone) {
        this.phone = this.phone_number;
    } else if (this.phone && !this.phone_number) {
        this.phone_number = this.phone;
    }

    if (this.current_tier !== this.verificationTier) {
        this.verificationTier = this.current_tier;
    }
    
    next();
});

// =========================================================
// 🔏 ENCAPSULATED MODEL INSTANCE INTERACTION METHOD
// =========================================================
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Cryptographic comparison evaluation anomaly.');
    }
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
