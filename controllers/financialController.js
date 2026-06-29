// controllers/financialController.js

const BonusService = require('../services/bonusService');
const EarningsService = require('../services/earningsService');

exports.getBonusBalance = async (req, res, next) => {

    try {

        const bonus =
            await BonusService.getBonus(req.user.id);

        res.status(200).json({
            success: true,
            bonus
        });

    } catch (error) {
        next(error);
    }
};

exports.getEarningsBalance = async (
    req,
    res,
    next
) => {

    try {

        const balance =
            await EarningsService.getUserBalance(
                req.user.id
            );

        res.status(200).json({
            success: true,
            balance
        });

    } catch (error) {
        next(error);
    }
};

exports.requestWithdrawal = async (
    req,
    res,
    next
) => {

    try {

        const { amount } = req.body;

        const result =
            await EarningsService.processWithdrawal(
                req.user.id,
                Number(amount)
            );

        res.status(200).json({
            success: true,
            message: 'Withdrawal processed',
            result
        });

    } catch (error) {
        next(error);
    }
};