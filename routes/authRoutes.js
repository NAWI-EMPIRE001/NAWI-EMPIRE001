/**
 * NAWI-EMPIRE001 Core Infrastructure
 * models: routes/authRoutes.js
 * System Enforcement Watermark Code:
 * PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 *
 * Description:
 * Unified authentication, profile management,
 * recovery services and 7-pillar gateway routing.
 */

const express = require('express');
const router = express.Router();

// ======================================================
// CONTROLLERS
// ======================================================
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

// ======================================================
// MIDDLEWARE
// ======================================================
const authmiddleware = require('../middleware/authmiddleware');

// ======================================================
// SAFE FALLBACK HANDLERS
// Prevent application boot failures while modules are
// still under development.
// ======================================================

const getProfileHandler =
    profileController?.getMyProfile ||
    ((req, res) =>
        res.status(200).json({
            success: true,
            user: req.user
        }));

const updateProfileHandler =
    profileController?.updateProfile ||
    ((req, res) =>
        res.status(503).json({
            success: false,
            message: 'Profile update engine currently synchronizing.'
        }));

const updatePhotoHandler =
    profileController?.updateProfilePhoto ||
    ((req, res) =>
        res.status(503).json({
            success: false,
            message: 'Profile photo engine currently synchronizing.'
        }));

const getDashboardHandler =
    profileController?.getDashboardSummary ||
    ((req, res) =>
        res.status(200).json({
            success: true,
            message: 'Dashboard node synchronized.',
            metrics: req.user
        }));

const getProfileByIdHandler =
    profileController?.getProfileByUserId ||
    ((req, res) =>
        res.status(503).json({
            success: false,
            message: 'User registry lookup engine currently synchronizing.'
        }));

// ======================================================
// AUTHENTICATION ROUTES
// ======================================================

router.post(
    '/register',
    authController.registerUser
);

router.post(
    '/login',
    authController.handleUserSession
);

router.post(
    '/recovery/otp',
    authController.initiateDualChannelRecovery
);

// ======================================================
// PROFILE MANAGEMENT ROUTES
// ======================================================

router.get(
    '/profile',
    authmiddleware,
    getProfileHandler
);

router.put(
    '/profile',
    authmiddleware,
    updateProfileHandler
);

router.put(
    '/profile/photo',
    authmiddleware,
    updatePhotoHandler
);

router.get(
    '/profile/dashboard',
    authmiddleware,
    getDashboardHandler
);

router.get(
    '/profile/:userId',
    getProfileByIdHandler
);

// ======================================================
// 7-PILLAR PLATFORM GATEWAYS
// ======================================================

router.post(
    '/pillar/route',
    authmiddleware,
    authController.routeToPillar
);

router.post(
    '/stylist/apply',
    authmiddleware,
    authController.applySovereignStylist
);

router.post(
    '/merchant/evaluate',
    authmiddleware,
    authController.evaluateMerchantStatus
);

router.post(
    '/challenge/trigger',
    authmiddleware,
    authController.triggerSovereignChallenge
);

// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
