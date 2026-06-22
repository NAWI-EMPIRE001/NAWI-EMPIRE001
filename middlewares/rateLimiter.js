// =====================================================
// NAWI-EMPIRE001 RATE LIMITING ENGINE
// FILE: middlewares/rateLimiter.js
// PURPOSE:
// - Protect API against abuse
// - Prevent brute force attacks
// - Secure wallet & escrow operations
// =====================================================

const rateLimit = require('express-rate-limit');

// =====================================================
// GENERIC RESPONSE FORMAT
// =====================================================
const limiterResponse = (req, res) => {
    return res.status(429).json({
        success: false,
        status: 'RATE_LIMIT_EXCEEDED',
        message:
            'Too many requests detected. Please wait before trying again.',
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
};

// =====================================================
// GLOBAL API LIMITER
// Applies to all routes
// =====================================================
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: limiterResponse,
    trustProxy: true
});

// =====================================================
// AUTH LIMITER
// Login / Register / Password Reset
// =====================================================
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'AUTH_LOCKED',
            message:
                'Too many authentication attempts. Try again in 15 minutes.'
        });
    }
});

// =====================================================
// WALLET / ESCROW / PAYOUT LIMITER
// High-value financial endpoints
// =====================================================
const financialLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'FINANCIAL_RATE_LIMIT',
            message:
                'Financial operations temporarily limited. Please wait.'
        });
    }
});

// =====================================================
// UPLOAD LIMITER
// Media / 3D Asset uploads
// =====================================================
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'UPLOAD_LIMIT_REACHED',
            message:
                'Upload limit reached. Please wait before uploading again.'
        });
    }
});

// =====================================================
// STREAM LIMITER
// Live Battle / Stream creation
// =====================================================
const streamLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'STREAM_LIMIT_REACHED',
            message:
                'Too many stream actions detected. Please wait.'
        });
    }
});

// =====================================================
// MARKETPLACE LIMITER
// Product creation / listing
// =====================================================
const marketplaceLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res) => {
        return res.status(429).json({
            success: false,
            status: 'MARKET_LIMIT_REACHED',
            message:
                'Marketplace activity limit exceeded.'
        });
    }
});

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
    globalLimiter,
    authLimiter,
    financialLimiter,
    uploadLimiter,
    streamLimiter,
    marketplaceLimiter
};
