// ======================================================
// 👑 NAWI-EMPIRE001 - UNIFIED API RESPONSE ENGINE
// FILE: utils/apiResponse.js
// PURPOSE: Standardized API responses across all pillars
// ======================================================

// ======================================================
// SUCCESS RESPONSE
// ======================================================
const successResponse = (
    res,
    {
        statusCode = 200,
        message = 'Operation completed successfully.',
        data = null,
        meta = {}
    } = {}
) => {

    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        data,
        meta
    });
};

// ======================================================
// ERROR RESPONSE
// ======================================================
const errorResponse = (
    res,
    {
        statusCode = 500,
        message = 'Internal server error.',
        error = null,
        errors = []
    } = {}
) => {

    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),

        // Hide internal errors in production
        error:
            process.env.NODE_ENV === 'production'
                ? undefined
                : error,

        errors
    });
};

// ======================================================
// PAGINATED RESPONSE
// ======================================================
const paginatedResponse = (
    res,
    {
        statusCode = 200,
        message = 'Data retrieved successfully.',
        data = [],
        page = 1,
        limit = 10,
        total = 0
    } = {}
) => {

    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        timestamp: new Date().toISOString(),

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
        },

        data
    });
};

// ======================================================
// CREATED RESPONSE
// ======================================================
const createdResponse = (
    res,
    {
        message = 'Resource created successfully.',
        data = null
    } = {}
) => {

    return res.status(201).json({
        success: true,
        statusCode: 201,
        message,
        timestamp: new Date().toISOString(),
        data
    });
};

// ======================================================
// UNAUTHORIZED RESPONSE
// ======================================================
const unauthorizedResponse = (
    res,
    message = 'Unauthorized access.'
) => {

    return res.status(401).json({
        success: false,
        statusCode: 401,
        message,
        timestamp: new Date().toISOString()
    });
};

// ======================================================
// FORBIDDEN RESPONSE
// ======================================================
const forbiddenResponse = (
    res,
    message = 'Access forbidden.'
) => {

    return res.status(403).json({
        success: false,
        statusCode: 403,
        message,
        timestamp: new Date().toISOString()
    });
};

// ======================================================
// NOT FOUND RESPONSE
// ======================================================
const notFoundResponse = (
    res,
    message = 'Requested resource not found.'
) => {

    return res.status(404).json({
        success: false,
        statusCode: 404,
        message,
        timestamp: new Date().toISOString()
    });
};

// ======================================================
// VALIDATION ERROR RESPONSE
// ======================================================
const validationErrorResponse = (
    res,
    errors = [],
    message = 'Validation failed.'
) => {

    return res.status(400).json({
        success: false,
        statusCode: 400,
        message,
        timestamp: new Date().toISOString(),
        errors
    });
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse,
    createdResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    validationErrorResponse
};