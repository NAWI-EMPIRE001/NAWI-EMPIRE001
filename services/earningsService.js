// services/earningsService.js

const PlatformRevenue = require('../models/PlatformRevenue');
const EarningsLedger = require('../models/EarningsLedger');

class EarningsService {

    static async creditUserEarning(
        userId,
        amount,
        source = 'GENERAL'
    ) {

        return EarningsLedger.create({
            user: userId,
            amount,
            source,
            status: 'AVAILABLE'
        });
    }

    static async getUserBalance(userId) {

        const earnings =
            await EarningsLedger.find({
                user: userId,
                status: 'AVAILABLE'
            });

        return earnings.reduce(
            (sum, tx) => sum + tx.amount,
            0
        );
    }

    static async processWithdrawal(userId, amount) {

        const availableBalance =
            await this.getUserBalance(userId);

        if (availableBalance < amount)
            throw new Error('Insufficient earnings');

        const revenue =
            await PlatformRevenue.findOne({
                revenueType: 'OPERATIONS'
            });

        if (!revenue)
            throw new Error(
                'Operational revenue pool unavailable'
            );

        if (revenue.amount < amount)
            throw new Error(
                'Platform operational pool insufficient'
            );

        revenue.amount -= amount;

        await revenue.save();

        await EarningsLedger.create({
            user: userId,
            amount,
            source: 'WITHDRAWAL',
            status: 'PAID'
        });

        return {
            success: true,
            amount
        };
    }
}

module.exports = EarningsService;