const express =
    require('express');

const router =
    express.Router();

const auth =
    require(
        '../middleware/authMiddleware'
    );

const walletController =
    require(
        '../controllers/walletController'
    );

router.get(
    '/',
    auth,
    walletController.getWallet
);

router.get(
    '/transactions',
    auth,
    walletController.getTransactions
);

models.exports = router;
