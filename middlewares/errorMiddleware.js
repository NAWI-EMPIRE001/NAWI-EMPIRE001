// ======================================================
// NAWI-EMPIRE001
// FILE: middlewares/errorMiddleware.js
// PURPOSE: Global API Error Engine
// ======================================================

// Route Not Found Middleware
const notFound = (req, res, next) => {

    const error = new Error(
        `Route Not Found - ${req.originalUrl}`
    );

    res.status(404);

    next(error);
};


// Global Error Handler
const errorHandler = (err, req, res, next) => {

    let statusCode =
        res.statusCode === 200
            ? 500
            : res.statusCode;

    res.status(statusCode);

    console.error('❌ API ERROR:', err);

    res.json({
        success: false,
        status: statusCode,
        message: err.message || 'Internal Server Error',

        stack:
            process.env.NODE_ENV === 'production'
                ? null
                : err.stack
    });
};


// Async Wrapper
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
