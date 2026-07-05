// ======================================================
// 👑 NAWI-EMPIRE001 NOTIFICATION SERVICE
// FILE: services/notificationService.js
// PURPOSE: Central Notification Dispatch Engine
// ======================================================

const Notification = require('../models/Notification');

// Socket emitter utility (safe fallback)
let emitToUser = () => {};

try {
    const socketEmitter = require('../utils/socketEmitter');

    if (socketEmitter.emitToUser) {
        emitToUser = socketEmitter.emitToUser;
    }
} catch (error) {
    console.warn(
        '⚠️ socketEmitter not found. Real-time notifications disabled.'
    );
}

// ======================================================
// CREATE DATABASE NOTIFICATION
// ======================================================

const createNotification = async ({
    recipient,
    sender = null,
    title,
    message,
    type = 'SYSTEM',
    pillar = 'CORE',
    data = {}
}) => {
    try {

        const notification = await Notification.create({
            recipient,
            sender,
            title,
            message,
            type,
            pillar,
            data,
            isRead: false
        });

        // Broadcast instantly if user is online
        emitToUser(recipient.toString(), 'notification:new', notification);

        return notification;

    } catch (error) {

        console.error(
            '❌ Notification creation failed:',
            error.message
        );

        throw error;
    }
};

// ======================================================
// BULK NOTIFICATION
// ======================================================

const notifyMultipleUsers = async ({
    recipients = [],
    sender = null,
    title,
    message,
    type = 'SYSTEM',
    pillar = 'CORE',
    data = {}
}) => {

    try {

        const notifications = [];

        for (const userId of recipients) {

            const notification =
                await createNotification({
                    recipient: userId,
                    sender,
                    title,
                    message,
                    type,
                    pillar,
                    data
                });

            notifications.push(notification);
        }

        return notifications;

    } catch (error) {

        console.error(
            '❌ Bulk notification failed:',
            error.message
        );

        throw error;
    }
};

// ======================================================
// WALLET ALERTS
// ======================================================

const sendWalletAlert = async (
    userId,
    amount,
    action
) => {

    return createNotification({
        recipient: userId,
        title: 'Wallet Update',
        message:
            `${action} of ${amount} EC processed successfully.`,
        type: 'WALLET',
        pillar: 'SOVEREIGN_EXCHANGE',
        data: {
            amount,
            action
        }
    });
};

// ======================================================
// ESCROW ALERTS
// ======================================================

const sendEscrowAlert = async (
    userId,
    escrowId,
    status
) => {

    return createNotification({
        recipient: userId,
        title: 'Escrow Status Updated',
        message:
            `Escrow transaction is now ${status}.`,
        type: 'ESCROW',
        pillar: 'SOVEREIGN_EXCHANGE',
        data: {
            escrowId,
            status
        }
    });
};

// ======================================================
// MARKETPLACE ALERTS
// ======================================================

const sendMarketplaceAlert = async (
    userId,
    assetName
) => {

    return createNotification({
        recipient: userId,
        title: 'Marketplace Activity',
        message:
            `${assetName} has received new activity.`,
        type: 'MARKETPLACE',
        pillar: 'SOVEREIGN_EXCHANGE',
        data: {
            assetName
        }
    });
};

// ======================================================
// STREAM ALERTS
// ======================================================

const sendStreamAlert = async (
    userId,
    streamTitle
) => {

    return createNotification({
        recipient: userId,
        title: 'Live Stream Started',
        message:
            `${streamTitle} is now live.`,
        type: 'STREAM',
        pillar: 'ARENA_NODE'
    });
};

// ======================================================
// VERIFICATION ALERTS
// ======================================================

const sendVerificationAlert = async (
    userId,
    status
) => {

    return createNotification({
        recipient: userId,
        title: 'Verification Update',
        message:
            `Your verification status changed to ${status}.`,
        type: 'VERIFICATION',
        pillar: 'CORE'
    });
};

// ======================================================
// FOLLOW ALERTS
// ======================================================

const sendFollowAlert = async (
    recipientId,
    followerName
) => {

    return createNotification({
        recipient: recipientId,
        title: 'New Follower',
        message:
            `${followerName} started following you.`,
        type: 'FOLLOW',
        pillar: 'CORE'
    });
};

// ======================================================
// SYSTEM BROADCAST
// ======================================================

const sendSystemBroadcast = async (
    recipients,
    title,
    message
) => {

    return notifyMultipleUsers({
        recipients,
        title,
        message,
        type: 'SYSTEM',
        pillar: 'CORE'
    });
};

// ======================================================
// MARK AS READ
// ======================================================

const markAsRead = async (
    notificationId,
    userId
) => {

    return Notification.findOneAndUpdate(
        {
            _id: notificationId,
            recipient: userId
        },
        {
            isRead: true,
            readAt: new Date()
        },
        {
            new: true
        }
    );
};

// ======================================================
// GET USER NOTIFICATIONS
// ======================================================

const getUserNotifications = async (
    userId,
    limit = 50
) => {

    return Notification.find({
        recipient: userId
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'username profilePicture');
};

// ======================================================
// EXPORT SERVICE
// ======================================================

models.exports = {
    createNotification,
    notifyMultipleUsers,

    sendWalletAlert,
    sendEscrowAlert,
    sendMarketplaceAlert,
    sendStreamAlert,
    sendVerificationAlert,
    sendFollowAlert,

    sendSystemBroadcast,

    markAsRead,
    getUserNotifications
};
