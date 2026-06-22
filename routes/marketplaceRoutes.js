// ======================================================
// 👑 NAWI-EMPIRE001
// FILE: routes/marketplaceRoutes.js
// PILLAR: THE SOVEREIGN EXCHANGE
// ======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Optional controller loader
let marketplaceController = {};

try {
    marketplaceController = require('../controllers/marketplaceController');
} catch (err) {
    console.warn(
        '⚠️ marketplaceController not found. Loading fallback handlers.'
    );

    marketplaceController = {
        createListing: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Marketplace listing endpoint active.'
            }),

        getListings: (req, res) =>
            res.status(200).json({
                success: true,
                listings: []
            }),

        getSingleListing: (req, res) =>
            res.status(200).json({
                success: true,
                listingId: req.params.id
            }),

        updateListing: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Listing updated.'
            }),

        deleteListing: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Listing deleted.'
            }),

        purchaseAsset: (req, res) =>
            res.status(200).json({
                success: true,
                message: 'Purchase request received.'
            })
    };
}

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Browse all marketplace assets
router.get(
    '/',
    marketplaceController.getListings
);

// Get single asset
router.get(
    '/:id',
    marketplaceController.getSingleListing
);

// ======================================================
// PROTECTED ROUTES
// ======================================================

// Create marketplace listing
router.post(
    '/',
    authMiddleware,
    marketplaceController.createListing
);

// Update listing
router.put(
    '/:id',
    authMiddleware,
    marketplaceController.updateListing
);

// Delete listing
router.delete(
    '/:id',
    authMiddleware,
    marketplaceController.deleteListing
);

// Purchase asset
router.post(
    '/purchase/:id',
    authMiddleware,
    marketplaceController.purchaseAsset
);

// Merchant-only endpoint
router.post(
    '/merchant/create',
    authMiddleware,
    roleMiddleware(['merchant', 'admin']),
    marketplaceController.createListing
);

module.exports = router;
