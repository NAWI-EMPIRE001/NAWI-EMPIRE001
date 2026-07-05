module.exports = (req, res, next) => {

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const allowedRoles = [
        'ADMIN',
        'SUPER_ADMIN',
        'MASTER_CEO'
    ];

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Administrative access denied'
        });
    }

    next();
};