/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Models: middlewares/authMiddleware.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY
 * Description: Unified Elite Gateway managing Token Verification, 7 Pillars Gates, and Tier Rank Access.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Synchronized with your real lowercase folder path
const mongoose = require('mongoose');

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

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NAWI_EMPIRE_SECRET');

        // Build safe dynamic query conditions to prevent CastErrors on invalid ObjectIds
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

        // Integrity security check interceptor
        if (user.accountStatus === 'banned' || user.security?.is_banned === true) {
            return res.status(403).json({
                success: false,
                message: 'Account suspended from ecosystem due to security parameters.'
            });
        }

        // Attach verified user profile context directly onto request stream
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
            const allowedPillars = [
                'ARENA_NODE',
                'SOVEREIGN_EXCHANGE',
                'VISIBILITY_ENGINE',
                'CULINARY_MATRIX',
                'AESTHETIC_NEXUS',
                'DIAMONDBACK_FORGE',
                'SONIC_LEDGER'
            ];

            const normalizedInput = pillarName.toUpperCase().trim();

            if (!allowedPillars.includes(normalizedInput)) {
                return res.status(400).json({
                    success: false,
                    message: `Component '${pillarName}' does not map to architectural configuration pillars.`
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
            const userTier = req.user?.current_tier || req.user?.verificationTier || 1;

            if (userTier < minimumLevel) {
                return res.status(403).json({
                    success: false,
                    message: `Elevated Access Denied. Verification level ${minimumLevel} required. Current level: ${userTier}`
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
        const isMerchant = req.user?.current_tier >= 2 || req.user?.identity?.legacy_rank === 'Verified Merchant';

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
        const rank = req.user?.identity?.legacy_rank;

        if (rank !== 'Founder' && rank !== 'Administrator') {
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
        if (req.user?.security?.is_banned) {
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
        if (req.user?.security?.scam_alert_flag > 5) {
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
        if (req.user?.security?.is_banned) {
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

models.exports = authMiddleware;
