const User = require('../modele/User');
const Transaction = require('../module/Transaction');

/**
 * WALLET BALANCE
 */
exports.getWalletBalance = async (req, res) => {

    try {

        const user = await User.findOne({
            userId: req.user.userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Wallet owner not found.'
            });
        }

        return res.status(200).json({
            success: true,
            wallet: user.wallet
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * ADMIN COIN DEPOSIT
 */
exports.depositCoins = async (req, res) => {

    try {

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid deposit amount.'
            });
        }

        const user = await User.findOne({
            userId: req.user.userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Wallet owner not found.'
            });
        }

        user.wallet.empire_coins += Number(amount);

        await user.save();

        if (Transaction) {
            await Transaction.create({
                userId: user.userId,
                amount,
                type: 'DEPOSIT',
                status: 'COMPLETED'
            });
        }

        return res.status(200).json({
            success: true,
            wallet: user.wallet
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * COIN TRANSFER
 */
exports.transferCoins = async (req, res) => {

    try {

        const {
            receiverId,
            amount
        } = req.body;

        const sender = await User.findOne({
            userId: req.user.userId
        });

        const receiver = await User.findOne({
            userId: receiverId
        });

        if (!sender || !receiver) {
            return res.status(404).json({
                success: false,
                message: 'Account record missing.'
            });
        }

        if (sender.wallet.empire_coins < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient Empire Coins.'
            });
        }

        sender.wallet.empire_coins -= amount;
        receiver.wallet.empire_coins += amount;

        await sender.save();
        await receiver.save();

        if (Transaction) {

            await Transaction.create({
                userId: sender.userId,
                amount,
                type: 'TRANSFER_OUT',
                status: 'COMPLETED'
            });

            await Transaction.create({
                userId: receiver.userId,
                amount,
                type: 'TRANSFER_IN',
                status: 'COMPLETED'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Transfer completed.'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * WITHDRAWAL REQUEST
 */
exports.withdrawCoins = async (req, res) => {

    try {

        const { amount } = req.body;

        const user = await User.findOne({
            userId: req.user.userId
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Wallet owner not found.'
            });
        }

        if (user.wallet.empire_coins < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance.'
            });
        }

        user.wallet.empire_coins -= amount;
        user.wallet.pending_conversion += amount;

        await user.save();

        if (Transaction) {

            await Transaction.create({
                userId: user.userId,
                amount,
                type: 'WITHDRAWAL',
                status: 'PENDING'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Withdrawal request submitted.',
            wallet: user.wallet
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * TRANSACTION HISTORY
 */
exports.getWalletHistory = async (req, res) => {

    try {

        const history = await Transaction.find({
            userId: req.user.userId
        })
        .sort({ createdAt: -1 })
        .limit(100);

        return res.status(200).json({
            success: true,
            count: history.length,
            history
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
