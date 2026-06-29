const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post(
    '/',
    authMiddleware,
    reportController.createReport
);

router.get(
    '/',
    authMiddleware,
    adminMiddleware,
    reportController.getAllReports
);

router.put(
    '/:id/resolve',
    authMiddleware,
    adminMiddleware,
    reportController.resolveReport
);

module.exports = router;