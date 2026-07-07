/**
 * ==========================================================
 * NAWI-EMPIRE001
 * FILE: routes/postRoutes.js
 * ==========================================================
 */

const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const postController = require('../controllers/postController');

const authMiddleware =
    require('../middlewares/authMiddleware');

const {
    uploadMultipleMedia
} = require('../middlewares/uploadMiddleware');

const viewIncrementLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

/**
 * ==========================================================
 * PUBLIC ROUTES
 * ==========================================================
 */

// Get all public posts
router.get('/', postController.getPosts);

// Get single post
router.get('/:id', postController.getPost);

// Get user posts
router.get('/user/:userId', postController.getUserPosts);


/**
 * ==========================================================
 * PROTECTED ROUTES
 * ==========================================================
 */

// Create post
router.post(
    '/',
    authMiddleware,
    postController.createPost
);

// Update post
router.put(
    '/:id',
    authMiddleware,
    postController.updatePost
);

// Delete post
router.delete(
    '/:id',
    authMiddleware,
    postController.deletePost
);

// Increment views
router.patch(
    '/:id/view',
    viewIncrementLimiter,
    authMiddleware,
    postController.incrementView
);

module.exports = router;