module.exports = (pillarKey) => {

    return async (
        req,
        res,
        next
    ) => {

        try {

            if (
                !req.user ||
                !req.user.pillarAccess
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        'Pillar access denied'
                });
            }

            if (
                req.user
                    .pillarAccess[
                    pillarKey
                ] !== true
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        `${pillarKey} disabled for this account`
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                success: false,
                message:
                    'Pillar validation failed'
            });
        }
    };
};
