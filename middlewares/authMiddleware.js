/**
 * NAWI-EMPIRE001 Core Infrastructure
 * models:middleware/authMiddleware.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Unified Elite Gateway managing Token Verification, 7 Pillars Gates, and Tier Rank Access.
 */

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user');

if (!process.env.JWT_SECRET) {
    throw new Error(
        'FATAL SECURITY ERROR: JWT_SECRET environment variable is missing from configuration targets.'
    );
}

const JWT_SECRET = process.env.JWT_SECRET;

const BLOCKED_ACCOUNT_STATUSES = Object.freeze([
    'suspended',
    'under_review',
    'banned'
]);

const ALLOWED_PILLARS = Object.freeze({
    ARENA_NODE: 'gaming_studio',
    SOVEREIGN_EXCHANGE: 'marketplace',
    VISIBILITY_ENGINE: 'ads_program',
    CULINARY_MATRIX: 'kitchen_meal',
    AESTHETIC_NEXUS: 'content_creation',
    DIAMONDBACK_FORGE: 'marketplace',
    SONIC_LEDGER: 'music_promotion'
});

/**
 * ==========================================================
 * 1. CORE AUTHENTICATION GATEWAY (Protects Private Routes)
 * ==========================================================
 */
const authMiddleware = async (req, res, next) => {
    try {
        let token;
        const authHeader = req.headers.authorization;

        if (authHeader && /^Bearer\s+/i.test(authHeader)) {
            const parts = authHeader.trim().split(/\s+/);

            if (parts.length !== 2) {
                return res.status(401).json({
                    success: false,
                    message: 'Malformed authorization header structure.'
                });
            }

            token = parts[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication token missing.'
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication session expired. Please sign in again.'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Invalid token signature structure.'
            });
        }

        if (!decoded || typeof decoded !== 'object') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token payload signature.'
            });
        }

        const conditions = [];

        if (typeof decoded.userId === 'string' && decoded.userId.trim()) {
            conditions.push({ userId: decoded.userId });
        }

        const objectId = decoded.id || decoded.userId;
        if (objectId && mongoose.Types.ObjectId.isValid(objectId)) {
            conditions.push({ _id: objectId });
        }

        if (!conditions.length) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token structure.'
            });
        }

        // 🛡️ FIXED: Removed .lean() to allow downstream route handlers to manipulate and save user documents directly
        const user = await User.findOne({ $or: conditions }).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found within system registry.'
            });
        }

        if (BLOCKED_ACCOUNT_STATUSES.includes(user.accountStatus)) {
            return res.status(403).json({
                success: false,
                message: 'Account restricted or banned from ecosystem due to security parameters.'
            });
        }

        req.user = user;
        req.userId = user.userId;
        req.role = user.role || 'user';
        req.tier = Number(user.current_tier || 1);

        next();

    } catch (err) {
        next(err);
    }
};

/**
 * ==========================================================
 * 2. SEVEN PILLARS INTERACTIVE LAYOUT CONTROL
 * ==========================================================
 */
authMiddleware.authorizePillar = (pillarName) => {
    return async (req, res, next) => {
        try {
            const pillar = String(pillarName || '').trim().toUpperCase();
            const key = ALLOWED_PILLARS[pillar];

            if (!key) {
                return res.status(400).json({
                    success: false,
                    message: `Component '${pillarName}' does not map to architectural configuration pillars.`
                });
            }

            if (!req.user?.pillarAccess || !req.user.pillarAccess[key]) {
                return res.status(403).json({
                    success: false,
                    message: `Access Denied. Your profile node does not hold explicit credentials for the ${pillar} ecosystem.`
                });
            }

            req.pillar = pillar;
            next();
        } catch (err) {
            next(err);
        }
    };
};

/**
 * ==========================================================
 * 3. TIER VERIFICATION LEVEL ENFORCER
 * ==========================================================
 */
authMiddleware.requireVerification = (minimumLevel = 1) => {
    return (req, res, next) => {
        const tier = Number(req.tier || 1);

        if (tier < minimumLevel) {
            return res.status(403).json({
                success: false,
                message: `Elevated Access Denied. Verification tier level ${minimumLevel} required. Current level: ${tier}`
            });
        }
        next();
    };
};

/**
 * ==========================================================
 * 4. TIER 2 VERIFIED MERCHANT GUARD
 * ==========================================================
 */
authMiddleware.requireMerchant = (req, res, next) => {
    const merchant =
        req.role === 'merchant' ||
        req.role === 'sovereign' ||
        Number(req.tier) >= 2;

    if (!merchant) {
        return res.status(403).json({
            success: false,
            message: 'Merchant verification level required to access trade nodes.'
        });
    }
    next();
};

/**
 * ==========================================================
 * 5. FOUNDER & ADMINISTRATOR COMMAND AUTHORITY
 * ==========================================================
 */
authMiddleware.requireAdmin = (req, res, next) => {
    const admin = req.role === 'admin' || req.role === 'sovereign';

    if (!admin) {
        return res.status(403).json({
            success: false,
            message: 'Administrative authorization required. Action logged.'
        });
    }
    next();
};

/**
 * ==========================================================
 * 6. ESCROW SHIELD VALUE PROTECTION
 * ==========================================================
 */
authMiddleware.requireEscrowAccess = (req, res, next) => {
    if (BLOCKED_ACCOUNT_STATUSES.includes(req.user?.accountStatus)) {
        return res.status(403).json({
            success: false,
            message: 'Escrow access restricted for this account node.'
        });
    }
    next();
};

/**
 * ==========================================================
 * 7. VISIBILITY ENGINE PRIVILEGES SHIELD
 * ==========================================================
 */
authMiddleware.requireAdvertisingAccess = (req, res, next) => {
    if (Number(req.user?.security?.compliance_violations || 0) > 5) {
        return res.status(403).json({
            success: false,
            message: 'Advertising privileges restricted due to compliance indicators.'
        });
    }
    next();
};

/**
 * ==========================================================
 * 8. DIAMONDBACK FORGE CREATOR ACCESS
 * ==========================================================
 */
authMiddleware.requireCreatorAccess = (req, res, next) => {
    if (BLOCKED_ACCOUNT_STATUSES.includes(req.user?.accountStatus)) {
        return res.status(403).json({
            success: false,
            message: 'Creator privileges restricted for this account node.'
        });
    }
    next();
};

authMiddleware.BLOCKED_ACCOUNT_STATUSES = BLOCKED_ACCOUNT_STATUSES;
authMiddleware.ALLOWED_PILLARS = ALLOWED_PILLARS;

module.exports = authMiddleware;
