const express = require('express');

const router = express.Router();

const authmiddleware =
    require('../middleware/authmiddleware');

const authController =
    require('../controllers/authController');

/*
|--------------------------------------------------------------------------
| PROFILE MANAGEMENT
|--------------------------------------------------------------------------
*/

router.get(
    '/',
    authmiddleware,
    authController.getProfile
);

router.put(
    '/update',
    authmiddleware,
    authController.updateProfile
);

router.get(
    '/dashboard',
    authmiddleware,
    authController.getProfileDashboard
);

router.put(
    '/theme',
    authmiddleware,
    authController.updateTheme
);

router.post(
    '/merchant-evaluation',
    authmiddleware,
    authController.evaluateMerchantStatus
);

router.post(
    '/business-verification',
    authmiddleware,
    authController.submitBusinessVerification
);

router.post(
    '/password-recovery',
    authController.requestPasswordReset
);

router.post(
    '/verify-otp',
    authController.verifyOTP
);

router.post(
    '/reset-password',
    authController.resetPassword
);

module.exports = router;
