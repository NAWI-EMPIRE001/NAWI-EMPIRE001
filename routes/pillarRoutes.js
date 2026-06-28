const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/authMiddleware');

const pillarAccessMiddleware =
    require(
        '../middleware/pillarAccessMiddleware'
    );

const authController =
    require('../controllers/authController');

/*
|--------------------------------------------------------------------------
| NAWI-EMPIRE001
| THE 7 PILLARS ROUTING SYSTEM
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| 1. ARENA NODE
|--------------------------------------------------------------------------
*/

router.get(
    '/arena-node',
    authMiddleware,
    pillarAccessMiddleware(
        'gaming_studio'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 2. SOVEREIGN EXCHANGE
|--------------------------------------------------------------------------
*/

router.get(
    '/sovereign-exchange',
    authMiddleware,
    pillarAccessMiddleware(
        'marketplace'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 3. VISIBILITY ENGINE
|--------------------------------------------------------------------------
*/

router.get(
    '/visibility-engine',
    authMiddleware,
    pillarAccessMiddleware(
        'ads_program'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 4. CULINARY MATRIX
|--------------------------------------------------------------------------
*/

router.get(
    '/culinary-matrix',
    authMiddleware,
    pillarAccessMiddleware(
        'kitchen_meal'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 5. AESTHETIC NEXUS
|--------------------------------------------------------------------------
*/

router.get(
    '/aesthetic-nexus',
    authMiddleware,
    pillarAccessMiddleware(
        'content_creation'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 6. DIAMONDBACK FORGE
|--------------------------------------------------------------------------
*/

router.get(
    '/diamondback-forge',
    authMiddleware,
    pillarAccessMiddleware(
        'content_creation'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| 7. SONIC LEDGER
|--------------------------------------------------------------------------
*/

router.get(
    '/sonic-ledger',
    authMiddleware,
    pillarAccessMiddleware(
        'music_promotion'
    ),
    authController.routeToPillar
);

/*
|--------------------------------------------------------------------------
| UNIVERSAL PILLAR HANDSHAKE
|--------------------------------------------------------------------------
*/

router.post(
    '/connect',
    authMiddleware,
    authController.routeToPillar
);

models.exports = router;
