/**
 * NAWI-EMPIRE001 Global Ecosystem
 * FILE: models/wallet.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 ecosystem
 * 
 * DECOUPLED ARCHITECTURAL MAP (Phase 2 Normalized Typography):
 *  - Core Wallet Engine      -> models/wallet.js (This Document)
 *  - Relational Transactions  -> models/transaction.js (External Reference)
 *  - Escrow Engagements      -> models/escrow.js (External Reference)
 *  - System Audit Vault      -> models/audit.js (External Reference)
 */

const mongoose = require('mongoose');
const crypto = require('crypto');

// ======================================================
// CONSTANTS & FINITE STATE MACHINE (FSM) RULES
// ======================================================
const VALID_PILLARS = [
    'ARENA_NODE',
    'SOVEREIGN_EXCHANGE',
    'VISIBILITY_ENGINE',
    'CULINARY_MATRIX',
    'AESTHETIC_NEXUS',
    'DIAMONDBACK_FORGE',
    'SONIC_LEDGER',
    'GENERAL'
];

const ALLOWED_STATES = ['ACTIVE', 'RESTRICTED', 'FROZEN'];

const STATE_TRANSITIONS = {
    'ACTIVE': ['RESTRICTED', 'FROZEN'],
    'RESTRICTED': ['ACTIVE', 'FROZEN'],
    'FROZEN': ['ACTIVE', 'RESTRICTED']
};

const parseDec = (val) => val ? parseFloat(val.toString()) : 0;

// ======================================================
// SCHEMA CONFIGURATION
// ======================================================
const walletSchema = new mongoose.Schema({

    platform_watermark: {
        type: String,
        default: 'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001',
        immutable: true
    },

    walletId: {
        type: String,
        unique: true,
        immutable: true,
        index: true,
        default: () => `NW-${crypto.randomUUID().substring(0, 12).toUpperCase()}`
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Base Currency Ledger Configuration
    baseCurrency: { type: String, default: 'COIN', uppercase: true },
    supportedCurrencies: { type: [String], default: ['COIN', 'USD', 'NGN'] },
    walletPrecision: { type: Number, default: 4, immutable: true },

    // Version Control & Structural State Counters
    walletVersion: { type: String, default: '3.1.0' },
    currencyVersion: { type: String, default: '1.0.0' },
    migrationVersion: { type: Number, default: 3 },
    ledgerSequence: { type: Number, default: 0 },
    auditVersion: { type: Number, default: 1 },

    // Forensic Cryptographic Integrity Checksum
    balanceHash: { type: String, default: '' },

    // Lifecycle Ownership & Soft Delete Fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Financial Balances (BSON Decimal128 Core Architecture)
    coinBalance: { type: mongoose.Schema.Types.Decimal128, default: 5.0000 },
    escrowBalance: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },
    frozenBalance: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },
    usdBalance: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },
    nairaBalance: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },

    totalEarned: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },
    totalWithdrawn: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },

    // Defensive Finite State Machine (FSM) Fields
    walletStatus: {
        type: String,
        enum: ALLOWED_STATES,
        default: 'ACTIVE',
        validate: {
            validator: function(nextStatus) {
                if (this.isNew) return true;
                const currentStatus = this._previousStatus || this.walletStatus;
                if (currentStatus === nextStatus) return true;
                return STATE_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
            },
            message: () => `Invalid ledger state mutation path requested.`
        }
    },
    lockReason: { type: String, default: '', trim: true },

    restrictions: {
        withdrawalBlocked: { type: Boolean, default: false },
        transferBlocked: { type: Boolean, default: false },
        complianceHold: { type: Boolean, default: false }
    },

    compliance: {
        kycLevel: { type: String, default: 'LEVEL_0', uppercase: true },
        amlStatus: { type: String, enum: ['CLEARED', 'FLAGGED', 'SUSPENDED'], default: 'CLEARED' },
        riskScore: { type: Number, default: 0, min: 0, max: 100 },
        lastComplianceReview: { type: Date }
    },

    limits: {
        maxWithdrawal: { type: mongoose.Schema.Types.Decimal128, default: 10000.00 },
        maxDeposit: { type: mongoose.Schema.Types.Decimal128, default: 50000.00 },
        maxEscrow: { type: mongoose.Schema.Types.Decimal128, default: 25000.00 }
    },

    // Operational Volatility Logging
    lastOperationTime: { type: Date },
    dailyTransactionCount: { type: Number, default: 0 },
    dailyVolume: { type: mongoose.Schema.Types.Decimal128, default: 0.0000 },
    failedWithdrawalAttempts: { type: Number, default: 0 },
    failedTransferAttempts: { type: Number, default: 0 },
    suspiciousActivityCount: { type: Number, default: 0 },
    velocityScore: { type: Number, default: 0 },

    // Forensic System Audit Mappings
    lastAuditAt: { type: Date },
    lastAuditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    auditStatus: { type: String, enum: ['VERIFIED', 'UNAUDITED', 'DISCREPANCY'], default: 'UNAUDITED' },

    preferences: {
        preferredCurrency: { type: String, default: 'COIN', uppercase: true },
        timezone: { type: String, default: 'Africa/Lagos' },
        locale: { type: String, default: 'en-NG' }
    },

    statistics: {
        largestDeposit: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        largestWithdrawal: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        averageTransaction: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        successfulTransactions: { type: Number, default: 0 },
        failedTransactions: { type: Number, default: 0 }
    },

    pillarRevenue: {
        ARENA_NODE: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        SOVEREIGN_EXCHANGE: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        VISIBILITY_ENGINE: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        CULINARY_MATRIX: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        AESTHETIC_NEXUS: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        DIAMONDBACK_FORGE: { type: mongoose.Schema.Types.Decimal128, default: 0.00 },
        SONIC_LEDGER: { type: mongoose.Schema.Types.Decimal128, default: 0.00 }
    },

    lastTransactionDate: { type: Date },
    lastDepositDate: { type: Date },
    lastWithdrawalDate: { type: Date }

    // NOTE: Growing log arrays extracted into external transactional data spaces to prevent document bloat.

}, {
    timestamps: true,
    collection: 'wallets',
    optimisticConcurrency: true
});

// ======================================================
// SCHEMA INITIALIZATION LIFECYCLE PINNING
// ======================================================
walletSchema.post('init', function() {
    this._previousStatus = this.walletStatus;
});

// ======================================================
// VIRTUALS
// ======================================================
walletSchema.virtual('availableBalance').get(function () {
    const coin = parseDec(this.coinBalance);
    const frozen = parseDec(this.frozenBalance);
    return Math.max(0, coin - frozen);
});

// ======================================================
// PRE-SAVE HOOK (Integrity Engine, Calculations & Controls)
// ======================================================
walletSchema.pre('save', function (next) {
    const now = new Date();

    const coin = parseDec(this.coinBalance);
    const escrow = parseDec(this.escrowBalance);
    const frozen = parseDec(this.frozenBalance);
    const earned = parseDec(this.totalEarned);
    const withdrawn = parseDec(this.totalWithdrawn);
    const dailyVol = parseDec(this.dailyVolume);

    if (coin < 0 || escrow < 0 || frozen < 0) {
        return next(new Error('CRITICAL INTEGRITY FAILURE: Financial account bounds cannot drop below zero.'));
    }
    if (coin < frozen) {
        return next(new Error('CRITICAL INTEGRITY FAILURE: System coin allocation cannot slide below frozen threshold.'));
    }
    if (earned < withdrawn) {
        return next(new Error('CRITICAL INTEGRITY FAILURE: Withdrawal ledger calculations breaks balance solvency.'));
    }
    if (dailyVol < 0) {
        return next(new Error('CRITICAL INTEGRITY FAILURE: System operational velocity matrix tracks negative value.'));
    }

    if (this.lastOperationTime) {
        const lastOpDate = this.lastOperationTime.toDateString();
        const currentDate = now.toDateString();
        if (lastOpDate !== currentDate) {
            this.dailyTransactionCount = 0;
            this.dailyVolume = mongoose.Types.Decimal128.fromString("0.0000");
        }
    }

    // Extended Cryptographic Forensic Formula Mapping
    if (this.isModified('coinBalance') || this.isModified('escrowBalance') || this.isModified('usdBalance') || this.isModified('nairaBalance') || this.isModified('walletStatus')) {
        this.ledgerSequence += 1;
        this.auditVersion += 1;
        const checksumPayload = `${this.walletId}:${this.walletVersion}:${this.walletStatus}:${coin}:${escrow}:${this.ledgerSequence}:${this.auditVersion}`;
        this.balanceHash = crypto.createHash('sha256').update(checksumPayload).digest('hex');
    }

    this._previousStatus = this.walletStatus;
    next();
});

// ======================================================
// PRE-UPDATE HOOK (Intercepts Bypass Vectors)
// ======================================================
walletSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();
    if (update.$inc && (update.$inc.coinBalance || update.$inc.escrowBalance)) {
        update.$inc.ledgerSequence = update.$inc.ledgerSequence || 1;
        update.$inc.auditVersion = update.$inc.auditVersion || 1;
    }
    next();
});

// ======================================================
// INTERNAL SECURITY INSTANCE METHODS
// ======================================================
walletSchema.methods.validateAmount = function (amount) {
    if (!amount || isNaN(amount) || amount <= 0) {
        throw new Error('Invalid financial operation execution amount.');
    }
};

walletSchema.methods.assertActive = function (action = 'Transaction') {
    if (this.isDeleted) throw new Error(`Execution denied: Wallet account has been flagged as DELETED.`);
    if (this.walletStatus === 'FROZEN') {
        throw new Error(`Execution denied: Account state is locked as FROZEN. Reference: ${this.lockReason || 'Administrative Lock'}`);
    }
};

walletSchema.methods.verifyBalanceHash = function () {
    const coin = parseDec(this.coinBalance);
    const escrow = parseDec(this.escrowBalance);
    const checksumPayload = `${this.walletId}:${this.walletVersion}:${this.walletStatus}:${coin}:${escrow}:${this.ledgerSequence}:${this.auditVersion}`;
    const generatedHash = crypto.createHash('sha256').update(checksumPayload).digest('hex');
    return generatedHash === this.balanceHash;
};

walletSchema.methods.updateOperationalMetrics = function (amount) {
    this.lastOperationTime = new Date();
    this.dailyTransactionCount += 1;
    
    const currentDailyVolume = parseDec(this.dailyVolume);
    this.dailyVolume = mongoose.Types.Decimal128.fromString((currentDailyVolume + amount).toString());
};

// ======================================================
// ATOMIC LIFECYCLE WRAPPERS (MongoDB Session Native)
// ======================================================
walletSchema.methods.lockEscrow = async function (amount, options = {}) {
    this.validateAmount(amount);
    this.assertActive('Escrow Lock');
    
    if (amount > parseDec(this.limits.maxEscrow)) throw new Error('Transaction execution boundaries broken: Exceeds absolute escrow limit.');

    const coin = parseDec(this.coinBalance);
    if (coin < amount) throw new Error('Insufficient system balance to fulfill escrow lock allocation.');

    this.coinBalance = mongoose.Types.Decimal128.fromString((coin - amount).toString());
    this.escrowBalance = mongoose.Types.Decimal128.fromString((parseDec(this.escrowBalance) + amount).toString());
    
    this.updateOperationalMetrics(amount);
    return await this.save(options);
};

walletSchema.methods.releaseEscrow = async function (amount, options = {}) {
    this.validateAmount(amount);
    
    const escrow = parseDec(this.escrowBalance);
    if (escrow < amount) throw new Error('Action aborted: Allocation request exceeds active escrow balance hold.');

    this.escrowBalance = mongoose.Types.Decimal128.fromString((escrow - amount).toString());
    this.coinBalance = mongoose.Types.Decimal128.fromString((parseDec(this.coinBalance) + amount).toString());
    
    this.updateOperationalMetrics(amount);
    return await this.save(options);
};

walletSchema.methods.refundEscrow = async function (amount, options = {}) {
    this.validateAmount(amount);

    const escrow = parseDec(this.escrowBalance);
    if (escrow < amount) throw new Error('Action aborted: Allocation request exceeds active escrow balance hold.');

    this.escrowBalance = mongoose.Types.Decimal128.fromString((escrow - amount).toString());
    this.coinBalance = mongoose.Types.Decimal128.fromString((parseDec(this.coinBalance) + amount).toString());
    
    this.updateOperationalMetrics(amount);
    return await this.save(options);
};

// ======================================================
// HIGH-CONCURRENCY STATIC ATOMIC HELPERS (BSON-Safe)
// ======================================================
walletSchema.statics.atomicCredit = async function(walletId, amount, pillar = 'GENERAL', session = null) {
    if (!VALID_PILLARS.includes(pillar)) {
        throw new Error(`Atomic operational update aborted: Targeting unverified structural pillar field: ${pillar}`);
    }

    this.validateAmount(amount);
    
    // Hardened Conversion Layer ensuring absolute protection against BSON type contamination
    const bsonDecimalAmount = mongoose.Types.Decimal128.fromString(amount.toString());

    const query = { 
        walletId: walletId, 
        walletStatus: 'ACTIVE', 
        'restrictions.complianceHold': false, 
        isDeleted: false 
    };

    const updateExpressions = {
        $inc: { 
            coinBalance: bsonDecimalAmount, 
            totalEarned: bsonDecimalAmount,
            [`pillarRevenue.${pillar}`]: bsonDecimalAmount,
            ledgerSequence: 1
        },
        $set: { 
            lastTransactionDate: new Date(), 
            lastDepositDate: new Date(),
            lastOperationTime: new Date()
        }
    };

    return await this.findOneAndUpdate(query, updateExpressions, { new: true, runValidators: true, session: session });
};

// ======================================================
// ATOMIC PERSISTED INDEX MAPS
// ======================================================
walletSchema.index({ walletId: 1 });
walletSchema.index({ user: 1, isDeleted: 1 });
walletSchema.index({ ledgerSequence: 1 });
walletSchema.index({ lastTransactionDate: -1 });
walletSchema.index({ walletStatus: 1, isDeleted: 1 });
walletSchema.index({ balanceHash: 1 });

// EXPORTS
const Wallet = mongoose.models.Wallet || mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
