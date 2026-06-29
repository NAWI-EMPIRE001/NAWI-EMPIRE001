// ======================================================
// NAWI-EMPIRE001
// FILE: services/milestoneService.js
// ======================================================

const UserMilestone = require('../models/UserMilestone');
const bonusService = require('./bonusService');

class MilestoneService {

    // ==================================================
    // TRACK USER ACTION
    // ==================================================
    async trackAction(userId, actionType) {

        let milestone =
            await UserMilestone.findOne({ user: userId });

        if (!milestone) {
            milestone = await UserMilestone.create({
                user: userId
            });
        }

        switch (actionType) {

            case 'LOGIN':
                milestone.totalLogins += 1;
                break;

            case 'UPLOAD':
                milestone.totalUploads += 1;
                break;

            case 'MARKETPLACE_TRANSACTION':
                milestone.marketplaceTransactions += 1;
                break;

            case 'PROFILE_COMPLETE':
                milestone.profileCompleted = true;
                break;

            default:
                break;
        }

        await milestone.save();

        await this.evaluateMilestones(milestone);

        return milestone;
    }

    // ==================================================
    // EVALUATE BONUS UNLOCK CONDITIONS
    // ==================================================
    async evaluateMilestones(milestone) {

        const loginRequirement =
            Number(process.env.BONUS_LOGIN_REQUIREMENT || 5);

        const uploadRequirement =
            Number(process.env.BONUS_UPLOAD_REQUIREMENT || 1);

        const transactionRequirement =
            Number(
                process.env.BONUS_TRANSACTION_REQUIREMENT || 1
            );

        const loginPassed =
            milestone.totalLogins >= loginRequirement;

        const uploadPassed =
            milestone.totalUploads >= uploadRequirement;

        const transactionPassed =
            milestone.marketplaceTransactions >=
            transactionRequirement;

        const profilePassed =
            milestone.profileCompleted === true;

        if (
            loginPassed &&
            uploadPassed &&
            transactionPassed &&
            profilePassed &&
            !milestone.bonusUnlocked
        ) {

            milestone.bonusUnlocked = true;

            await milestone.save();

            await bonusService.unlockBonus(
                milestone.user
            );
        }

        return milestone;
    }

    // ==================================================
    // MANUAL PROFILE COMPLETION HELPER
    // ==================================================
    async markProfileCompleted(userId) {

        return this.trackAction(
            userId,
            'PROFILE_COMPLETE'
        );
    }
}

module.exports = new MilestoneService();