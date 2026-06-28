// =====================================================
// 👑 NAWI-EMPIRE001 RATE LIMITING ENGINE
// FILE: middlewares/rateLimiter.js
// PURPOSE:
// - Protect API against abuse
// - Prevent brute-force attacks
// - Secure wallet, escrow, and payout operations
// - Protect uploads, streams, and marketplace activity
// =====================================================

const rateLimit = require('express-rate-limit');

// =====================================================
// SHARED RESPONSE HANDLER
// =====================================================

const limiterResponse = (status, message) => {
    return (req, res) => {
        const retryAfterSeconds =
            req.rateLimit?.resetTime
                ? Math.max(
                      0,
                      Math.ceil(
                          (new Date(req.rateLimit.resetTime) - Date.now()) /
                              1000
                      )
                  )
                : 60;

        return res.status(429).json({
            success: false,
            status,
            message,
            retryAfterSeconds,
            timestamp: new Date().toISOString()
        });
    };
};

// =====================================================
// GLOBAL API LIMITER
// =====================================================

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: process.env.NODE_ENV === 'production' ? 1000 : 5000,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'RATE_LIMIT_EXCEEDED',
        'Too many requests detected. Please try again later.'
    )
});

// =====================================================
// AUTH LIMITER
// LOGIN / REGISTER / PASSWORD RESET
// =====================================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: limiterResponse(
        'AUTH_LIMIT_REACHED',
        'Too many authentication attempts. Please wait before trying again.'
    )
});

// =====================================================
// FINANCIAL LIMITER
// WALLET / ESCROW / PAYOUT
// =====================================================

const financialLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'FINANCIAL_LIMIT_REACHED',
        'Financial activity temporarily restricted. Please wait and try again.'
    )
});

// =====================================================
// UPLOAD LIMITER
// MEDIA / ASSET UPLOADS
// =====================================================

const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'UPLOAD_LIMIT_REACHED',
        'Upload limit reached. Please wait before uploading again.'
    )
});

// =====================================================
// STREAM LIMITER
// LIVE STREAMS / BATTLES
// =====================================================

const streamLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'STREAM_LIMIT_REACHED',
        'Too many stream operations detected. Please slow down.'
    )
});

// =====================================================
// MARKETPLACE LIMITER
// PRODUCT CREATION / LISTINGS
// =====================================================

const marketplaceLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'MARKETPLACE_LIMIT_REACHED',
        'Marketplace activity limit exceeded. Please try again later.'
    )
});

// =====================================================
// MESSAGE LIMITER
// CHAT / DIRECT MESSAGES
// =====================================================

const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: limiterResponse(
        'MESSAGE_LIMIT_REACHED',
        'Too many messages sent. Please slow down.'
    )
});

// =====================================================
// EXPORTS
// =====================================================

model.exports = {
    globalLimiter,
    authLimiter,
    financialLimiter,
    uploadLimiter,
    streamLimiter,
    marketplaceLimiter,
    messageLimiter
};
