const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (
    req,
    res,
    next
) => {
    try {

        let token = null;

        const authHeader =
            req.headers.authorization;

        if (
            authHeader &&
            authHeader.startsWith('Bearer ')
        ) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    'Access denied. Authentication token missing.'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(
            decoded.id
        ).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    'User account not found.'
            });
        }

        if (
            user.accountStatus === 'banned' ||
            user.security.is_banned
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'Account suspended from ecosystem.'
            });
        }

        req.user = user;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
};

module.exports = authMiddleware;