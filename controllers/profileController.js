const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Verification = require('../models/Verification');

/**
 * =========================================================
 * GET MY PROFILE
 * =========================================================
 */
exports.getMyProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id)
            .select('-password -backupCodes');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        const wallet = await Wallet.findOne({
            user: user._id
        });

        const verification =
            await Verification.findOne({
                user: user._id
            })
            .sort({ createdAt: -1 });

        return res.status(200).json({

            success: true,

            profile: {

                userId: user.userId,

                username: user.username,

                email: user.email,

                phone: user.phone || '',

                role: user.role,

                accountStatus:
                    user.accountStatus,

                verificationTier:
                    user.verificationTier,

                profilePhoto:
                    user.profilePhoto,

                identity:
                    user.identity,

                sevenPillarAccess:
                    verification
                        ? verification.sevenPillarAccess
                        : null,

                verificationStatus:
                    verification
                        ? verification.status
                        : 'pending'
            },

            wallet: wallet
                ? {
                    coinBalance:
                        wallet.coinBalance,

                    escrowBalance:
                        wallet.escrowBalance,

                    frozenBalance:
                        wallet.frozenBalance
                }
                : null
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};

/**
 * =========================================================
 * GET PROFILE BY USER ID
 * =========================================================
 */
exports.getProfileByUserId = async (
    req,
    res
) => {

    try {

        const user =
            await User.findOne({
                userId:
                    req.params.userId
            })
            .select(
                '-password -email -backupCodes'
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found'
            });
        }

        return res.status(200).json({

            success: true,

            profile: {

                userId:
                    user.userId,

                username:
                    user.username,

                profilePhoto:
                    user.profilePhoto,

                verificationTier:
                    user.verificationTier,

                role:
                    user.role,

                identity:
                    {
                        sovereign_name:
                            user.identity
                                ?.sovereign_name,

                        legacy_rank:
                            user.identity
                                ?.legacy_rank,

                        id_verified:
                            user.identity
                                ?.id_verified
                    }
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                'Failed to retrieve public profile'
        });
    }
};

/**
 * =========================================================
 * UPDATE PROFILE
 * =========================================================
 */
exports.updateProfile = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found'
            });
        }

        user.phone =
            req.body.phone ||
            user.phone;

        user.profilePhoto =
            req.body.profilePhoto ||
            user.profilePhoto;

        if (
            req.body.sovereign_name
        ) {
            user.identity.sovereign_name =
                req.body.sovereign_name;
        }

        if (
            req.body.legacy_rank
        ) {
            user.identity.legacy_rank =
                req.body.legacy_rank;
        }

        await user.save();

        return res.status(200).json({

            success: true,

            message:
                'Profile updated successfully',

            profile: {

                userId:
                    user.userId,

                username:
                    user.username,

                profilePhoto:
                    user.profilePhoto,

                identity:
                    user.identity
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                'Profile update failed'
        });
    }
};

/**
 * =========================================================
 * UPDATE PROFILE PHOTO
 * =========================================================
 */
exports.updateProfilePhoto = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.user._id
            );

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    'User not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message:
                    'Profile image required'
            });
        }

        user.profilePhoto =
            `/uploads/${req.file.filename}`;

        await user.save();

        return res.status(200).json({

            success: true,

            message:
                'Profile photo updated',

            profilePhoto:
                user.profilePhoto
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                'Failed to update profile photo'
        });
    }
};

/**
 * =========================================================
 * GET PROFILE DASHBOARD SUMMARY
 * =========================================================
 */
exports.getDashboardSummary =
async (req, res) => {

    try {

        const user =
            await User.findById(
                req.user._id
            );

        const wallet =
            await Wallet.findOne({
                user: req.user._id
            });

        const verification =
            await Verification.findOne({
                user: req.user._id
            });

        return res.status(200).json({

            success: true,

            summary: {

                userId:
                    user.userId,

                username:
                    user.username,

                verificationTier:
                    user.verificationTier,

                verified:
                    user.identity
                        ?.id_verified,

                role:
                    user.role,

                wallet: {

                    coinBalance:
                        wallet?.coinBalance || 0,

                    escrowBalance:
                        wallet?.escrowBalance || 0
                },

                verificationStatus:
                    verification
                        ?.status || 'pending'
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                'Dashboard summary failed'
        });
    }
};
