const express =
    require('express');

const router =
    express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const roleMiddleware =
    require('../middleware/roleMiddleware');

const adminLedgerController =
    require('../controllers/adminLedgerController');

router.use(
    authMiddleware
);

router.use(
    roleMiddleware([
        'founder',
        'admin'
    ])
);

router.get(
    '/summary',
    adminLedgerController.getLedgerSummary
);

router.get(
    '/vault-status',
    adminLedgerController.getVaultStatus
);

router.post(
    '/create',
    adminLedgerController.createLedgerEntry
);

router.put(
    '/update/:id',
    adminLedgerController.updateLedgerMetrics
);

module.exports =
    router;
