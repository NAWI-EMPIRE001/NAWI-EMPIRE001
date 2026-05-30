const Notification = require('../models/Notification');

const notificationController = {

    // ==========================================
    // CREATE NOTIFICATION
    // ==========================================
    createNotification: async (
        userId,
        type,
        title,
        message
    ) => {

        try {

            return await Notification.create({
                userId,
                type,
                title,
                message,
                read: false
            });

        } catch (error) {

            console.error(error);

        }
    },

    // ==========================================
    // GET USER NOTIFICATIONS
    // ==========================================
    getNotifications: async (req, res) => {

        try {

            const notifications =
                await Notification.find({
                    userId: req.user._id
                })
                .sort({
                    createdAt: -1
                });

            return res.status(200).json({
                success: true,
                count: notifications.length,
                notifications
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    // ==========================================
    // MARK AS READ
    // ==========================================
    markAsRead: async (req, res) => {

        try {

            const notification =
                await Notification.findByIdAndUpdate(
                    req.params.id,
                    {
                        read: true
                    },
                    {
                        new: true
                    }
                );

            return res.status(200).json({
                success: true,
                notification
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    // ==========================================
    // MARK ALL AS READ
    // ==========================================
    markAllAsRead: async (req, res) => {

        try {

            await Notification.updateMany(
                {
                    userId: req.user._id,
                    read: false
                },
                {
                    read: true
                }
            );

            return res.status(200).json({
                success: true,
                message: "All notifications marked as read."
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

};

module.exports = notificationController;