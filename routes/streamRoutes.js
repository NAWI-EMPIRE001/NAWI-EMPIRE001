// ======================================================
// 👑 NAWI-EMPIRE001
// FILE: routes/streamRoutes.js
// PURPOSE: Global Live Streaming Infrastructure
// ======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');

// Optional controller loading
let streamController = {};

try {
    streamController = require('../controllers/streamController');
} catch (err) {

    console.warn(
        '⚠️ streamController missing. Using fallback handlers.'
    );

    streamController = {

        startStream: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Live stream initialized.'
            }),

        endStream: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Live stream terminated.'
            }),

        getStreams: (req, res) =>
            res.status(200).json({
                success: true,
                streams: []
            }),

        getSingleStream: (req, res) =>
            res.status(200).json({
                success: true,
                streamId: req.params.id
            }),

        joinStream: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Joined stream successfully.'
            }),

        leaveStream: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Left stream successfully.'
            })
    };
}

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Get all live streams
router.get(
    '/',
    streamController.getStreams
);

// Get stream details
router.get(
    '/:id',
    streamController.getSingleStream
);

// ======================================================
// AUTHENTICATED ROUTES
// ======================================================

// Start stream
router.post(
    '/start',
    authMiddleware,
    streamController.startStream
);

// End stream
router.put(
    '/end/:id',
    authMiddleware,
    streamController.endStream
);

// Join stream
router.post(
    '/join/:id',
    authMiddleware,
    streamController.joinStream
);

// Leave stream
router.post(
    '/leave/:id',
    authMiddleware,
    streamController.leaveStream
);

module.exports = router;
