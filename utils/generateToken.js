// ======================================================
// NAWI-EMPIRE001
// FILE: utils/generateToken.js
// PURPOSE: Secure JWT Authentication Generator
// ======================================================

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable missing');
    }

    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role || 'citizen',
            tier: user.tier || 1,
            verified: user.isVerified || false
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || '30d'
        }
    );
};

models.exports = generateToken;
