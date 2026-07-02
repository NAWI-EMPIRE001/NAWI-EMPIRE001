/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: middlewares/authMiddleware.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 * Description: Unified Elite Gateway managing Token Verification, 7 Pillars Gates, and Tier Rank Access.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

if (!process.env.JWT_SECRET) {
    throw new Error('FATAL SECURITY ERROR: JWT_SECRET environment variable is missing from configuration targets.');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ==========================================================
 * 1. CORE AUTHENTICATION GATEWAY (Protects Private Routes)
 * ==========================================================
 */
const authMiddleware = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication token missing.'
            });
        }

        // 🛡️ HARDENED: Strict verification using direct variable mapping (no insecure plain-string fallback)
        const decoded = jwt.verify(token, JWT_SECRET);

        const queryConditions = [];
        if (decoded.userId) {
            queryConditions.push({ userId: decoded.userId });
        }
        
        const potentialId = decoded.id || decoded.userId;
        if (potentialId && mongoose.Types.ObjectId.isValid(potentialId)) {
            queryConditions.push({ _id: potentialId });
        }

        if (queryConditions.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token structure.'
            });
        }

        const user = await User.findOne({ $or: queryConditions }).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found within system registry.'
            });
        }

        if (user.accountStatus === 'suspended' || user.accountStatus === 'under_review') {
            return res.status(403).json({
                success: false,
                message: 'Account suspended from ecosystem due to security parameters.'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.'
        });
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
            const allowedPillars = {
                'ARENA_NODE': 'gaming_studio',
                'SOVEREIGN_EXCHANGE': 'marketplace',
                'VISIBILITY_ENGINE': 'ads_program',
                'CULINARY_MATRIX': 'kitchen_meal',
                'AESTHETIC_NEXUS': 'content_creation',
                'DIAMONDBACK_FORGE': 'marketplace', // Extends via Merchant validation logic
                'SONIC_LEDGER': 'music_promotion'
            };

            const normalizedInput = pillarName.toUpperCase().trim();
            const matchingSchemaKey = allowedPillars[normalizedInput];

            if (!matchingSchemaKey) {
                return res.status(400).json({
                    success: false,
                    message: `Component '${pillarName}' does not map to architectural configuration pillars.`
                });
            }

            // 🛡️ HARDENED: Checks actual structural sub-document permissions inside user profiles
            if (!req.user?.pillarAccess || !req.user.pillarAccess[matchingSchemaKey]) {
                return res.status(403).json({
                    success: false,
                    message: `Access Denied. Your profile node does not hold explicit credentials for the ${normalizedInput} ecosystem.`
                });
            }

            req.pillar = normalizedInput;
            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };
};

/**
 * ==========================================================
 * 3. TIER VERIFICATION LEVEL ENFORCER
 * ==========================================================
 */
authMiddleware.requireVerification = (minimumLevel = 1) => {
    return async (req, res, next) => {
        try {
            const userTier = req.user?.current_tier || 1;

            if (userTier < minimumLevel) {
                return res.status(403).json({
                    success: false,
                    message: `Elevated Access Denied. Verification tier level ${minimumLevel} required. Current level: ${userTier}`
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    };
};

/**
 * ==========================================================
 * 4. TIER 2 VERIFIED MERCHANT GUARD
 * ==========================================================
 */
authMiddleware.requireMerchant = async (req, res, next) => {
    try {
        // 🛡️ HARDENED: Authorizes via immutable role indices and structural account tiers
        const isMerchant = req.user?.current_tier >= 2 || req.user?.role === 'merchant' || req.user?.role === 'sovereign';

        if (!isMerchant) {
            return res.status(403).json({
                success: false,
                message: 'Merchant verification level required to access trade nodes.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ==========================================================
 * 5. FOUNDER & ADMINISTRATOR COMMAND AUTHORITY
 * ==========================================================
 */
authMiddleware.requireAdmin = async (req, res, next) => {
    try {
        // 🛡️ HARDENED: Protected against string field manipulation by relying on strict system roles
        const isPrivileged = req.user?.role === 'admin' || req.user?.role === 'sovereign';

        if (!isPrivileged) {
            return res.status(403).json({
                success: false,
                message: 'Administrative authorization required. Action logged.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ==========================================================
 * 6. ESCROW SHIELD VALUE PROTECTION
 * ==========================================================
 */
authMiddleware.requireEscrowAccess = async (req, res, next) => {
    try {
        if (req.user?.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Escrow access restricted for this account node.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ==========================================================
 * 7. VISIBILITY ENGINE PRIVILEGES SHIELD
 * ==========================================================
 */
authMiddleware.requireAdvertisingAccess = async (req, res, next) => {
    try {
        if (req.user?.security?.compliance_violations > 5) {
            return res.status(403).json({
                success: false,
                message: 'Advertising privileges restricted due to compliance indicators.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * ==========================================================
 * 8. DIAMONDBACK FORGE CREATOR ACCESS
 * ==========================================================
 */
authMiddleware.requireCreatorAccess = async (req, res, next) => {
    try {
        if (req.user?.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Creator privileges restricted for this account node.'
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 🟢 FIXED: Typo corrected from models.exports to module.exports to guarantee clean compilation pass
module.exports = authMiddleware;
