// ======================================================
// 👑 NAWI-EMPIRE001 - VALIDATION ENGINE
// FILE: utils/validators.js
// PURPOSE: Centralized validation utilities
// ======================================================

const mongoose = require('mongoose');

// ======================================================
// EMAIL VALIDATION
// ======================================================
const isValidEmail = (email) => {

    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());
};

// ======================================================
// PASSWORD VALIDATION
// Minimum:
// - 8 characters
// - Uppercase
// - Lowercase
// - Number
// ======================================================
const isStrongPassword = (password) => {

    if (!password || typeof password !== 'string') {
        return false;
    }

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    return passwordRegex.test(password);
};

// ======================================================
// USERNAME VALIDATION
// Letters, numbers, underscores only
// ======================================================
const isValidUsername = (username) => {

    if (!username || typeof username !== 'string') {
        return false;
    }

    const usernameRegex =
        /^[a-zA-Z0-9_]{3,30}$/;

    return usernameRegex.test(username.trim());
};

// ======================================================
// PHONE NUMBER VALIDATION
// Supports international numbers
// ======================================================
const isValidPhone = (phone) => {

    if (!phone || typeof phone !== 'string') {
        return false;
    }

    const phoneRegex =
        /^\+?[1-9]\d{7,14}$/;

    return phoneRegex.test(phone.trim());
};

// ======================================================
// MONGODB OBJECT ID VALIDATION
// ======================================================
const isValidObjectId = (id) => {

    return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// COIN / WALLET AMOUNT VALIDATION
// ======================================================
const isValidAmount = (amount) => {

    return (
        typeof amount === 'number' &&
        !isNaN(amount) &&
        amount > 0
    );
};

// ======================================================
// MARKETPLACE PRICE VALIDATION
// ======================================================
const validatePrice = (price) => {

    if (
        typeof price !== 'number' ||
        isNaN(price)
    ) {
        return {
            valid: false,
            message: 'Price must be numeric.'
        };
    }

    if (price <= 0) {
        return {
            valid: false,
            message: 'Price must be greater than zero.'
        };
    }

    return {
        valid: true
    };
};

// ======================================================
// FILE TYPE VALIDATION
// ======================================================
const isAllowedFileType = (
    mimetype,
    allowedTypes = []
) => {

    return allowedTypes.includes(mimetype);
};

// ======================================================
// IMAGE FILE VALIDATION
// ======================================================
const isValidImage = (mimetype) => {

    const allowed = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif'
    ];

    return allowed.includes(mimetype);
};

// ======================================================
// AUDIO FILE VALIDATION
// ======================================================
const isValidAudio = (mimetype) => {

    const allowed = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/aac'
    ];

    return allowed.includes(mimetype);
};

// ======================================================
// VIDEO FILE VALIDATION
// ======================================================
const isValidVideo = (mimetype) => {

    const allowed = [
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'video/x-msvideo'
    ];

    return allowed.includes(mimetype);
};

// ======================================================
// REQUIRED FIELD VALIDATION
// ======================================================
const validateRequiredFields = (
    payload,
    requiredFields = []
) => {

    const missingFields = [];

    requiredFields.forEach((field) => {

        if (
            payload[field] === undefined ||
            payload[field] === null ||
            payload[field] === ''
        ) {
            missingFields.push(field);
        }
    });

    return {
        valid: missingFields.length === 0,
        missingFields
    };
};

// ======================================================
// PAGINATION VALIDATION
// ======================================================
const validatePagination = (
    page = 1,
    limit = 10
) => {

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || page < 1) {
        page = 1;
    }

    if (isNaN(limit) || limit < 1) {
        limit = 10;
    }

    if (limit > 100) {
        limit = 100;
    }

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

// ======================================================
// ESCROW STATUS VALIDATION
// ======================================================
const isValidEscrowStatus = (status) => {

    const allowedStatuses = [
        'PENDING',
        'HELD_IN_ESCROW',
        'RELEASED',
        'DISPUTED',
        'CANCELLED'
    ];

    return allowedStatuses.includes(status);
};

// ======================================================
// PLATFORM ROLE VALIDATION
// ======================================================
const isValidRole = (role) => {

    const roles = [
        'citizen',
        'merchant',
        'creator',
        'admin',
        'master'
    ];

    return roles.includes(role);
};

// ======================================================
// EXPORTS
// ======================================================
module.exports = {
    isValidEmail,
    isStrongPassword,
    isValidUsername,
    isValidPhone,
    isValidObjectId,
    isValidAmount,
    validatePrice,
    isAllowedFileType,
    isValidImage,
    isValidAudio,
    isValidVideo,
    validateRequiredFields,
    validatePagination,
    isValidEscrowStatus,
    isValidRole
};