/**
 * =========================================================
 * NAWI-EMPIRE001 Core Infrastructure
 * FILE: controllers/profileController.js
 * PURPOSE: User profile management and dashboard services
 * =========================================================
 */

const User = require('../models/user');

// Optional models so application can still boot if absent
let Wallet = null;
let Verification = null;

try {
    Wallet = require('../models/Wallet');
} catch (err) {
    console.warn('[PROFILE] Wallet model not found. Continuing without wallet collection.');
}

try {
    Verification = require('../models/Verification');
} catch (err) {
    console.warn('[PROFILE] Verification model not found. Continuing without verification collection.');
}

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

        const wallet = Wallet
            ? await Wallet.findOne({ user: user._id })
            : null;

        const verification = Verification
            ? await Verification.findOne({ user: user._id })
                .sort({ createdAt: -1 })
            : null;

        return res.status(200).json({
            success: true,
            profile: {
                id: user._id,
                userId: user.userId || user._id,
                username: user.username,
                email: user.email,
                phone: user.phone || user.phone_number || '',
                role: user.role || 'user',
                accountStatus: user.accountStatus || 'active',
                verificationTier:
                    user.verificationTier ||
                    user.current_tier ||
                    1,
                current_tier: user.current_tier || 1,
                profilePhoto: user.profilePhoto || '',
                identity: user.identity || {},
                pillarAccess: user.pillarAccess || [],
                sovereignStylistTheme:
                    user.sovereignStylistTheme || null,
                sevenPillarAccess:
                    verification?.sevenPillarAccess ||
                    user.pillarAccess ||
                    [],
                verificationStatus:
                    verification?.status ||
                    (user.verified ? 'approved' : 'pending')
            },

            wallet: {
                coinBalance:
                    wallet?.coinBalance ??
                    user.wallet?.empire_coins ??
                    5,

                escrowBalance:
                    wallet?.escrowBalance ??
                    user.complianceMetrics?.cleanEscrowTransactions ??
                    0,

                usdBalance:
                    user.wallet?.usdBalance ?? 0,

                ngnBalance:
                    user.wallet?.ngnBalance ?? 0
            }
        });

    } catch (error) {
        console.error('PROFILE RETRIEVAL ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
};

/**
 * =========================================================
 * GET PUBLIC PROFILE
 * =========================================================
 */
exports.getProfileByUserId = async (req, res) => {
    try {

        const searchQuery =
            req.params.userId.match(/^[0-9a-fA-F]{24}$/)
                ? { _id: req.params.userId }
                : { userId: req.params.userId };

        const user = await User.findOne(searchQuery)
            .select('-password -email -backupCodes');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            profile: {
                userId: user.userId || user._id,
                username: user.username,
                profilePhoto: user.profilePhoto || '',
                verificationTier:
                    user.verificationTier ||
                    user.current_tier ||
                    1,
                role: user.role || 'user',

                identity: {
                    sovereign_name:
                        user.identity?.sovereign_name ||
                        user.username,

                    legacy_rank:
                        user.identity?.legacy_rank ||
                        'Citizen',

                    id_verified:
                        user.identity?.id_verified ||
                        false
                },

                sovereignStylistTheme:
                    user.sovereignStylistTheme || null
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve public profile'
        });
    }
};

/**
 * =========================================================
 * UPDATE PROFILE
 * =========================================================
 */
exports.updateProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (req.body.phone) {
            user.phone = req.body.phone;
            user.phone_number = req.body.phone;
        }

        if (req.body.profilePhoto) {
            user.profilePhoto = req.body.profilePhoto;
        }

        if (!user.identity) {
            user.identity = {};
        }

        if (req.body.sovereign_name) {
            user.identity.sovereign_name =
                req.body.sovereign_name;
        }

        if (req.body.legacy_rank) {
            user.identity.legacy_rank =
                req.body.legacy_rank;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                userId: user.userId || user._id,
                username: user.username,
                profilePhoto: user.profilePhoto,
                identity: user.identity
            }
        });

    } catch (error) {

        console.error('PROFILE UPDATE ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Profile update failed'
        });
    }
};

/**
 * =========================================================
 * UPDATE PROFILE PHOTO
 * =========================================================
 */
exports.updateProfilePhoto = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Profile image required'
            });
        }

        user.profilePhoto = `/uploads/${req.file.filename}`;

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile photo updated',
            profilePhoto: user.profilePhoto
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update profile photo'
        });
    }
};

/**
 * =========================================================
 * GET DASHBOARD SUMMARY
 * =========================================================
 */
exports.getDashboardSummary = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User reference not found'
            });
        }

        const wallet = Wallet
            ? await Wallet.findOne({ user: user._id })
            : null;

        const verification = Verification
            ? await Verification.findOne({ user: user._id })
            : null;

        return res.status(200).json({
            success: true,

            summary: {
                userId: user.userId || user._id,
                username: user.username,

                verificationTier:
                    user.verificationTier ||
                    user.current_tier ||
                    1,

                verified:
                    user.identity?.id_verified ||
                    user.verified ||
                    false,

                role: user.role || 'user',

                wallet: {
                    coinBalance:
                        wallet?.coinBalance ??
                        user.wallet?.empire_coins ??
                        5,

                    escrowBalance:
                        wallet?.escrowBalance ??
                        user.complianceMetrics?.cleanEscrowTransactions ??
                        0
                },

                verificationStatus:
                    verification?.status ||
                    (user.verified ? 'approved' : 'pending')
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: 'Dashboard summary failed'
        });
    }
};
