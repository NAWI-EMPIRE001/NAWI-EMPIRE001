const analyticsService = require('../services/analyticsService');

exports.getDashboardAnalytics = async (req, res, next) => {
    try {

        const data = await analyticsService.getPlatformMetrics();

        res.status(200).json({
            success: true,
            analytics: data
        });

    } catch (error) {
        next(error);
    }
};

exports.getRevenueAnalytics = async (req, res, next) => {
    try {

        const revenue =
            await analyticsService.getRevenueMetrics();

        res.status(200).json({
            success: true,
            revenue
        });

    } catch (error) {
        next(error);
    }
};