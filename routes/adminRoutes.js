const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const {
    getDashboard,
    getUsers,
    freezeUserWallet,
    verifyCreator,
    banUser
} = require('../controllers/adminController');

router.use(authMiddleware, adminMiddleware);

router.get('/dashboard', getDashboard);

router.get('/users', getUsers);

router.put('/wallet/freeze/:userId', freezeUserWallet);

router.put('/verify/:userId', verifyCreator);

router.put('/ban/:userId', banUser);

module.exports = router;