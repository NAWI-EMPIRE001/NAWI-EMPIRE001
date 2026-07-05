/**
 * ======================================================
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * FILE: middlewares/pillarAccessMiddleware.js
 * PURPOSE: Enforce strict access control to NAWI-EMPIRE001 pillars.
 * ======================================================
 */

const logger = require('../utils/logger');
const platformPillars = require('../config/platformPillars');
const { ACCOUNT_STATUS, ERROR_CODES } = require('../config/constants');

module.exports = (pillarKey) => {
    return async (req, res, next) => {
        const timestamp = new Date().toISOString();
        const pillar = pillarKey;

        try {
            // 1. Input Validation
            if (!pillar || typeof pillar !== "string" || !platformPillars.isValid(pillar)) {
                return res.status(400).json({ success: false, code: ERROR_CODES.INVALID_PILLAR, pillar, message: "invalid pillar requested.", timestamp });
            }

            // 2. Authentication Check
            if (!req.user?._id) {
                return res.status(401).json({ success: false, code: ERROR_CODES.AUTHENTICATION_REQUIRED, pillar, message: "authentication required.", timestamp });
            }

            // 3. Administrative Bypass
            if (req.user?.role?.toUpperCase() === "ADMIN") return next();

            // 4. Account Status Verification
            if (req.user?.accountStatus !== ACCOUNT_STATUS.ACTIVE) {
                logger.warn(`access denied: user ${req.user._id} status is ${req.user.accountStatus}`);
                return res.status(403).json({ success: false, code: ERROR_CODES.ACCOUNT_NOT_ACTIVE, pillar, message: "account is not active.", timestamp });
            }

            // 5. Pillar Access Authorization
            const access = req.user?.pillarAccess;
            if (typeof access !== "object" || access === null || access[pillar] !== true) {
                logger.warn(`unauthorized access: user ${req.user._id} to ${pillar}`, { path: req.originalUrl, ip: req.ip });
                return res.status(403).json({ success: false, code: ERROR_CODES.PILLAR_ACCESS_DENIED, pillar, message: "unauthorized access.", timestamp });
            }

            next();
        } catch (error) {
            logger.error(`middleware error [pillarAccess]: ${error.message}`, { user: req.user?._id, pillar, stack: error.stack });
            return res.status(500).json({ success: false, code: ERROR_CODES.INTERNAL_SERVER_ERROR, pillar, message: "security validation failed.", timestamp });
        }
    };
};
