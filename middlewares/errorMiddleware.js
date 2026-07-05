/**
 * NAWI-EMPIRE001 Global Ecosystem
 * FILE: middlewares/errorMiddleware.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Funder Matrix: Excellency of NAWI-EMPIRE001 Ecosystem
 *
 * PURPOSE:
 * Global Error Engine
 * Handles API failures, validation errors,
 * authentication failures, route failures,
 * and production-safe responses.
 */

const mongoose = require('mongoose');

/**
 * ==========================================================
 * Route Not Found Middleware
 * ==========================================================
 */
const notFound = (req, res, next) => {
    const error = new Error(`Route Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};

/**
 * ==========================================================
 * Global Error Handler
 * ==========================================================
 */
const errorHandler = (err, req, res, next) => {

    let statusCode = err.statusCode || res.statusCode;

    if (!statusCode || statusCode === 200) {
        statusCode = 500;
    }

    let cleanMessage = err.message || 'Internal Server Error';
    let validationErrors;

    /**
     * ==========================================
     * Invalid Mongo ObjectId
     * ==========================================
     */
    if (err instanceof mongoose.Error.CastError) {

        statusCode = 400;
        cleanMessage = `Invalid resource identifier format for path: ${err.path}`;
    }

    /**
     * ==========================================
     * Duplicate Mongo Unique Key
     * ==========================================
     */
    else if (err.code === 11000) {

        statusCode = 409;

        const duplicateField =
            Object.keys(err.keyValue || {})[0] || 'resource';

        cleanMessage =
            `Unique restriction conflict. That ${duplicateField} already exists within the system database registry.`;
    }

    /**
     * ==========================================
     * Mongoose Validation Errors
     * ==========================================
     */
    else if (err instanceof mongoose.Error.ValidationError) {

        statusCode = 400;

        cleanMessage =
            'Ecosystem schema validation constraint violated.';

        validationErrors =
            Object.values(err.errors).map(error => error.message);
    }

    /**
     * ==========================================
     * Invalid JSON Payload
     * ==========================================
     */
    else if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        'body' in err
    ) {

        statusCode = 400;
        cleanMessage = 'Malformed JSON request body.';
    }

    /**
     * ==========================================
     * JWT Errors
     * ==========================================
     */
    else if (
        err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError'
    ) {

        statusCode = 401;
        cleanMessage = 'Authentication token is invalid or has expired.';
    }

    /**
     * ==========================================
     * Production Diagnostics
     * ==========================================
     */

    console.error('=================================================');
    console.error('NAWI-EMPIRE001 API ERROR INTERCEPTOR');
    console.error('Timestamp :', new Date().toISOString());
    console.error('Method    :', req.method);
    console.error('Route     :', req.originalUrl);
    console.error('User Node :', req.userId || 'UNAUTHENTICATED_NODE');
    console.error('Status    :', statusCode);
    console.error(err);
    console.error('=================================================');

    /**
     * ==========================================
     * Uniform API Response
     * ==========================================
     */

    res.status(statusCode).json({

        success: false,

        status: statusCode,

        message: cleanMessage,

        errors: validationErrors,

        path: req.originalUrl,

        method: req.method,

        timestamp: new Date().toISOString(),

        stack:
            process.env.NODE_ENV === 'production'
                ? undefined
                : err.stack
    });
};

/**
 * ==========================================================
 * Async Wrapper
 * Eliminates repetitive try/catch blocks
 * ==========================================================
 */
const asyncHandler = (fn) => {

    return (req, res, next) => {

        Promise.resolve(
            fn(req, res, next)
        ).catch(next);
    };
};

module.exports = {
    notFound,
    errorHandler,
    asyncHandler
};