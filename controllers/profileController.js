/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: controllers/profileController.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Description: Fully integrated Profile controller referencing synchronized 'module' storage structures.
 */

const User = require('../module/user'); // Fixed path to point directly to your real lowercase directory structure
const Wallet = require('../models/Wallet'); // Kept as secondary fallback references if collection exists
const Verification = require('../models/Verification');

/**
 * =========================================================
 * GET MY PROFILE
 * =========================================================
 */
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -backupCodes');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Search for external legacy wallet structures as fallback if required
        const wallet = await Wallet.findOne({ user: user._id });
        const verification = await Verification.findOne({ user: user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            profile: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                phone: user.phone || user.phone_number || '',
                role: user.role,
                accountStatus: user.accountStatus,
                verificationTier: user.verificationTier || user.current_tier,
                current_tier: user.current_tier,
                profilePhoto: user.profilePhoto || '',
                identity: user.identity,
                pillarAccess: user.pillarAccess,
                sovereignStylistTheme: user.sovereignStylistTheme,
                sevenPillarAccess: verification ? verification.sevenPillarAccess : user.pillarAccess,
                verificationStatus: verification ? verification.status : (user.verified ? 'approved' : 'pending')
            },
            // Gracefully dual-tracks schema inline wallet array or individual database collections
            wallet: {
                coinBalance: wallet ? wallet.coinBalance : (user.wallet ? user.wallet.empire_coins : 5),
                escrowBalance: wallet ? wallet.escrowBalance : (user.complianceMetrics ? user.complianceMetrics.cleanEscrowTransactions : 0),
                usdBalance: user.wallet ? user.wallet.usdBalance : 0,
                ngnBalance: user.wallet ? user.wallet.ngnBalance : 0
            }
        });

    } catch (error) {
        console.error('PROFILE RETRIEVAL ERROR:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
            error: error.message
        });
    }
};

/**
 * =========================================================
 * GET PROFILE BY USER ID
 * =========================================================
 */
exports.getProfileByUserId = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId })
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
                userId: user.userId,
                username: user.username,
                profilePhoto: user.profilePhoto || '',
                verificationTier: user.verificationTier || user.current_tier,
                role: user.role,
                identity: {
                    sovereign_name: user.identity?.sovereign_name || user.username,
                    legacy_rank: user.identity?.legacy_rank || 'Citizen',
                    id_verified: user.identity?.id_verified || false
                },
                sovereignStylistTheme: user.sovereignStylistTheme
            }
        });

    } catch (error) {
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

        // Safe parameter updating across schema bindings
        if (req.body.phone) {
            user.phone = req.body.phone;
            user.phone_number = req.body.phone;
        }

        user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

        if (req.body.sovereign_name) {
            if (!user.identity) user.identity = {};
            user.identity.sovereign_name = req.body.sovereign_name;
        }

        if (req.body.legacy_rank) {
            if (!user.identity) user.identity = {};
            user.identity.legacy_rank = req.body.legacy_rank;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                userId: user.userId,
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
        return res.status(500).json({
            success: false,
            message: 'Failed to update profile photo'
        });
    }
};

/**
 * =========================================================
 * GET PROFILE DASHBOARD SUMMARY
 * =========================================================
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User reference not found' });
        }

        const wallet = await Wallet.findOne({ user: req.user._id });
        const verification = await Verification.findOne({ user: req.user._id });

        return res.status(200).json({
            success: true,
            summary: {
                userId: user.userId,
                username: user.username,
                verificationTier: user.verificationTier || user.current_tier,
                verified: user.identity?.id_verified || user.verified,
                role: user.role,
                wallet: {
                    coinBalance: wallet ? wallet.coinBalance : (user.wallet ? user.wallet.empire_coins : 5),
                    escrowBalance: wallet ? wallet.escrowBalance : (user.complianceMetrics ? user.complianceMetrics.cleanEscrowTransactions : 0)
                },
                verificationStatus: verification ? verification.status : (user.verified ? 'approved' : 'pending')
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Dashboard summary failed'
        });
    }
};
