const Follow = require('../models/Follow');
const User = require('../models/User');

const followController = {

    // ==========================================
    // FOLLOW USER
    // ==========================================
    followUser: async (req, res) => {
        try {

            const followerId = req.user._id;
            const targetUserId = req.params.userId;

            if (followerId.toString() === targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: "You cannot follow yourself."
                });
            }

            const existingFollow = await Follow.findOne({
                follower: followerId,
                following: targetUserId
            });

            if (existingFollow) {
                return res.status(400).json({
                    success: false,
                    message: "Already following this user."
                });
            }

            await Follow.create({
                follower: followerId,
                following: targetUserId
            });

            await User.findByIdAndUpdate(
                followerId,
                { $inc: { "metrics.following_count": 1 } }
            );

            await User.findByIdAndUpdate(
                targetUserId,
                { $inc: { "metrics.follower_count": 1 } }
            );

            return res.status(200).json({
                success: true,
                message: "User followed successfully."
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    // ==========================================
    // UNFOLLOW USER
    // ==========================================
    unfollowUser: async (req, res) => {
        try {

            const followerId = req.user._id;
            const targetUserId = req.params.userId;

            const relationship = await Follow.findOne({
                follower: followerId,
                following: targetUserId
            });

            if (!relationship) {
                return res.status(404).json({
                    success: false,
                    message: "Follow relationship not found."
                });
            }

            await Follow.deleteOne({
                _id: relationship._id
            });

            await User.findByIdAndUpdate(
                followerId,
                { $inc: { "metrics.following_count": -1 } }
            );

            await User.findByIdAndUpdate(
                targetUserId,
                { $inc: { "metrics.follower_count": -1 } }
            );

            return res.status(200).json({
                success: true,
                message: "User unfollowed successfully."
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    // ==========================================
    // GET FOLLOWERS
    // ==========================================
    getFollowers: async (req, res) => {
        try {

            const followers = await Follow.find({
                following: req.params.userId
            }).populate(
                'follower',
                'username email identity'
            );

            return res.status(200).json({
                success: true,
                count: followers.length,
                followers
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    },

    // ==========================================
    // GET FOLLOWING
    // ==========================================
    getFollowing: async (req, res) => {
        try {

            const following = await Follow.find({
                follower: req.params.userId
            }).populate(
                'following',
                'username email identity'
            );

            return res.status(200).json({
                success: true,
                count: following.length,
                following
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: error.message
            });

        }
    }

};

module.exports = followController;
