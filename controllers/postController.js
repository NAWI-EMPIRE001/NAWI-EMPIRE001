/**
 * ==========================================================
 * NAWI-EMPIRE001
 * FILE: controllers/postController.js
 * PURPOSE:
 * Content publishing & retrieval engine
 * ==========================================================
 */

const Post = require('../models/Post');
const Media = require('../models/Media');
const postService = require('../services/postService');

const PLATFORM_WATERMARK =
    'PROTECTED_BY_DIAMONDBACK231_AUTHORITY_NAWI-EMPIRE001';

/**
 * ==========================================================
 * CREATE POST
 * ==========================================================
 */
exports.createPost = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            content,
            pillar,
            visibility = 'PUBLIC',
            mediaIds = [],
            tags = []
        } = req.body;

        const post = await postService.createPost({
            author: userId,
            content,
            pillar,
            visibility,
            mediaIds,
            tags
        });

        return res.status(201).json({
            success: true,
            message: 'Post published successfully.',
            watermark: PLATFORM_WATERMARK,
            data: post
        });

    } catch (error) {
        console.error('Create Post Error:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to publish post.'
        });
    }
};

/**
 * ==========================================================
 * GET SINGLE POST
 * ==========================================================
 */
exports.getPost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
            .populate('author', 'username profilePhoto verificationTier')
            .populate('media')
            .lean();

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ==========================================================
 * GET USER POSTS
 * ==========================================================
 */
exports.getUserPosts = async (req, res) => {
    try {

        const posts = await Post.find({
            author: req.params.userId,
            isDeleted: false
        })
            .populate('media')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ==========================================================
 * GET ALL POSTS
 * ==========================================================
 */
exports.getPosts = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const filter = {
            isDeleted: false,
            visibility: 'PUBLIC'
        };

        if (req.query.pillar) {
            filter.pillar = req.query.pillar;
        }

        // Hide anonymous system admin content
        if (process.env.SYSTEM_ADMIN_ID) {
            filter.author = {
                $ne: process.env.SYSTEM_ADMIN_ID
            };
        }

        const posts = await Post.find(filter)
            .populate(
                'author',
                'username profilePhoto verificationTier'
            )
            .populate('media')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Post.countDocuments(filter);

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total,
            data: posts
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ==========================================================
 * UPDATE POST
 * ==========================================================
 */
exports.updatePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        const isOwner =
            post.author.toString() === req.user.id;

        const isAdmin =
            req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        const allowedFields = [
            'content',
            'visibility',
            'tags'
        ];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                post[field] = req.body[field];
            }
        });

        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Post updated successfully.',
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ==========================================================
 * DELETE POST
 * SOFT DELETE
 * ==========================================================
 */
exports.deletePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        const isOwner =
            post.author.toString() === req.user.id;

        const isAdmin =
            req.user.role === 'ADMIN';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized.'
            });
        }

        post.isDeleted = true;
        post.deletedAt = new Date();

        await post.save();

        return res.status(200).json({
            success: true,
            message: 'Post deleted successfully.'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * ==========================================================
 * INCREMENT VIEW COUNT
 * ==========================================================
 */
exports.incrementView = async (req, res) => {
    try {

        const post = await Post.findByIdAndUpdate(
            req.params.id,
            {
                $inc: { views: 1 }
            },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found.'
            });
        }

        return res.status(200).json({
            success: true,
            views: post.views
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};