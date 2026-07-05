// ======================================================
// NAWI-EMPIRE001
// FILE: routes/payoutRoutes.js
// ======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const payoutController = require('../controllers/payoutController');

// Request withdrawal
router.post(
    '/withdraw',
    authMiddleware,
    payoutController.requestWithdrawal
);

// View own payout history
router.get(
    '/history',
    authMiddleware,
    payoutController.getPayoutHistory
);

// Admin approval
router.put(
    '/:id/approve',
    authMiddleware,
    adminMiddleware,
    payoutController.approvePayout
);

// Admin rejection
router.put(
    '/:id/reject',
    authMiddleware,
    adminMiddleware,
    payoutController.rejectPayout
);

module.exports = router;