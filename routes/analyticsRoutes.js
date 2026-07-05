// ======================================================
// NAWI-EMPIRE001
// FILE: routes/analyticsRoutes.js
// ======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const analyticsController = require('../controllers/analyticsController');

// Personal analytics
router.get(
    '/my',
    authMiddleware,
    analyticsController.getMyAnalytics
);

// Dashboard analytics
router.get(
    '/dashboard',
    authMiddleware,
    analyticsController.getDashboardAnalytics
);

// Platform-wide analytics (Admin only)
router.get(
    '/platform',
    authMiddleware,
    adminMiddleware,
    analyticsController.getPlatformAnalytics
);

module.exports = router;