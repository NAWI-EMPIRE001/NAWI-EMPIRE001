/**
 * NAWI-EMPIRE001 Core Infrastructure
 * Module: routes/auth.routes.js
 * System Enforcement Watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * Description: Fully optimized mapping for Authentication, Profiles, 7-Pillar Routing, and Security Engines.
 */

const express = require('express');
const router = express.Router();

// Import Unified Core Controllers
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

// Import System Infrastructure Middleware
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// CORE SECURE ONBOARDING & SESSIONS
// ==========================================
router.post('/register', authController.registerUser);
router.post('/login', authController.handleUserSession);
router.post('/recovery/otp', authController.initiateDualChannelRecovery);

// ==========================================
// UNIFIED CITIZEN PROFILE RECOVERY & MANAGEMENT
// ==========================================
router.get('/profile', authMiddleware, profileController.getMyProfile);
router.put('/profile', authMiddleware, profileController.updateProfile);
router.put('/profile/photo', authMiddleware, profileController.updateProfilePhoto);
router.get('/profile/dashboard', authMiddleware, profileController.getDashboardSummary);
router.get('/profile/:userId', profileController.getProfileByUserId);

// ==========================================
// 7-PILLAR GATEWAYS & ECOSYSTEM ENGINES
// ==========================================
router.post('/pillar/route', authMiddleware, authController.routeToPillar);
router.post('/stylist/apply', authMiddleware, authController.applySovereignStylist);
router.post('/merchant/evaluate', authMiddleware, authController.evaluateMerchantStatus);
router.post('/challenge/trigger', authMiddleware, authController.triggerSovereignChallenge);

module.exports = router;
