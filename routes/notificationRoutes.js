// ======================================================
// NAWI-EMPIRE001
// FILE: routes/notificationRoutes.js
// ======================================================

const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/authMiddleware');
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get(
    '/',
    authMiddleware,
    notificationController.getNotifications
);

// Get unread count
router.get(
    '/unread-count',
    authMiddleware,
    notificationController.getUnreadCount
);

// Mark one notification as read
router.put(
    '/:id/read',
    authMiddleware,
    notificationController.markAsRead
);

// Mark all as read
router.put(
    '/read-all',
    authMiddleware,
    notificationController.markAllAsRead
);

// Delete notification
router.delete(
    '/:id',
    authMiddleware,
    notificationController.deleteNotification
);

module.exports = router;