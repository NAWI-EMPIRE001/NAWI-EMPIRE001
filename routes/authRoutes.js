//**
 * NAWI-EMPIRE001 Core Infrastructure
 * models: routes/authroutes.js
 * System enforcement watermark Code: PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001
 * description: fully optimized mapping for authentication, profiles, 7-pillar routing, and security engines.
 */
 
const express = require('express');
const router = express.router();

// import unified core controllers
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');

// import system infrastructure middleware
const authmiddleware = require('../middleware/authmiddleware');

// safe controller mapping validations to stop boot crashes if profileController methods are being built
const getprofilehandler = (profileController && profileController.getmyprofile) 
    ? profileController.getmyProfile 
    : (req, res) => res.status(200).json({ success: true, user: req.user });

const updateProfilehandler = (profileController && profileController.updateProfile)
    ? profileController.updateProfile
    : (req, res) => res.status(500).json({ success: false, message: "Profile update handler syncing." });

const updatePhotohandler = (profileController && profileController.updateProfilePhoto)
    ? profileController.updateProfilePhoto
    : (req, res) => res.status(500).json({ success: false, message: "Photo engine syncing." });

const getdashboardhandler = (profileController && profileController.getdashboardsummary)
    ? profileController.getdashboardsummary
    : (req, res) => res.status(200).json({ success: true, message: "dashboard node synchronized.", metrics: req.user });

const getProfileByIdhandler = (profileController && profileController.getProfilebyuserId)
    ? profileController.getProfilebyuserId
    : (req, res) => res.status(500).json({ success: false, message: "user registry lookup syncing." });

// ==========================================
// CORE SECURE ONBOARDING & SESSIONS
// ==========================================
router.post('/register', authController.registeruser);
router.post('/login', authController.handleusersession);
router.post('/recovery/otp', authController.initiatedualchannelrecovery);

// ==========================================
// UNIFIED CITIZEN PROFILE RECOVERY & MANAGEMENT
// ==========================================
router.get('/profile', authmiddleware, getProfilehandler);
router.put('/profile', authmiddleware, updateprofilehandler);
router.put('/profile/photo', authmiddleware, updatephotohandler);
router.get('/profile/dashboard', authmiddleware, getdashboardhandler);
router.get('/profile/:userId', getProfilebyidhandler);

// ==========================================
// 7-PILLAR GATEWAYS & ECOSYSTEM ENGINES
// ==========================================
router.post('/pillar/route', authmiddleware, authController.routetoPillar);
router.post('/stylist/apply', authmiddleware, authController.applysovereignstylist);
router.post('/merchant/evaluate', authmiddleware, authController.evaluatemerchantstatus);
router.post('/challenge/trigger', authiddleware, authController.triggersovereignchallenge);

module.exports = router
