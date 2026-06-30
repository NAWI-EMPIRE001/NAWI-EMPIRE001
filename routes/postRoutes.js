/**
 * ==========================================================
 * NAWI-EMPIRE001
 * FILE: routes/postRoutes.js
 * ==========================================================
 */

const express = require('express');
const router = express.Router();

const postController = require('../controllers/postController');

const authMiddleware =
    require('../middlewares/authMiddleware');

const {
    uploadMultipleMedia
} = require('../middlewares/uploadMiddleware');

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
    authMiddleware,
    postController.incrementView
);

module.exports = router;