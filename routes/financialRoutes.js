// routes/financialRoutes.js

const express = require('express');
const router = express.Router();

const financialController =
    require('../controllers/financialController');

const authMiddleware =
    require('../middlewares/authMiddleware');

// =====================================
// BONUS
// =====================================

router.get(
    '/bonus',
    authMiddleware,
    financialController.getBonusBalance
);

// =====================================
// EARNINGS
// =====================================

router.get(
    '/earnings',
    authMiddleware,
    financialController.getEarningsBalance
);

// =====================================
// WITHDRAWAL
// =====================================

router.post(
    '/withdraw',
    authMiddleware,
    financialController.requestWithdrawal
);

module.exports = router;