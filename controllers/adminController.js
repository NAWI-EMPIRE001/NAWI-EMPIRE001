const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Report = require('../models/Report');

exports.getAdminDashboard = async (req, res, next) => {

    try {

        const users = await User.countDocuments();
        const wallets = await Wallet.countDocuments();
        const reports = await Report.countDocuments();

        res.status(200).json({
            success: true,
            dashboard: {
                totalUsers: users,
                totalWallets: wallets,
                totalReports: reports
            }
        });

    } catch (error) {
        next(error);
    }
};

exports.getUsers = async (req, res, next) => {

    try {

        const users = await User
            .find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        next(error);
    }
};

exports.freezeUser = async (req, res, next) => {

    try {

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { accountStatus: 'FROZEN' },
            { new: true }
        );

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        next(error);
    }
};