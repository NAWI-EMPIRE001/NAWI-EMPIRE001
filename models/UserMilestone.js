const mongoose = require('mongoose');

const UserMilestoneSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    uploadsCount: {
        type: Number,
        default: 0
    },

    loginDays: {
        type: Number,
        default: 0
    },

    marketplaceTransactions: {
        type: Number,
        default: 0
    },

    followersCount: {
        type: Number,
        default: 0
    },

    liveStreamsCompleted: {
        type: Number,
        default: 0
    },

    profileCompleted: {
        type: Boolean,
        default: false
    },

    onboardingCompleted: {
        type: Boolean,
        default: false
    },

    bonusEligible: {
        type: Boolean,
        default: false
    },

    milestoneLevel: {
        type: String,
        enum: [
            'NEWCOMER',
            'BRONZE',
            'SILVER',
            'GOLD',
            'PLATINUM'
        ],
        default: 'NEWCOMER'
    }

}, {
    timestamps: true,
    collection: 'user_milestones'
});

module.exports = mongoose.model(
    'UserMilestone',
    UserMilestoneSchema
);