const Report = require('../models/Report');

exports.createReport = async (req, res, next) => {
    try {
        const report = await Report.create({
            ...req.body,
            reporter: req.user._id
        });

        res.status(201).json({
            success: true,
            report
        });

    } catch (error) {
        next(error);
    }
};

exports.getAllReports = async (req, res, next) => {
    try {

        const reports = await Report
            .find()
            .populate('reporter')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {
        next(error);
    }
};

exports.resolveReport = async (req, res, next) => {
    try {

        const report = await Report.findByIdAndUpdate(
            req.params.id,
            {
                status: 'RESOLVED',
                resolvedBy: req.user._id
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        next(error);
    }
};