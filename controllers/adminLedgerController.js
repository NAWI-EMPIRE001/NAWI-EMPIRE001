const DailyLedger =
    require('../models/DailyLedger');

exports.getLedgerSummary =
async (req, res) => {

    try {

        const latestLedger =
            await DailyLedger
            .findOne()
            .sort({
                createdAt: -1
            });

        if (!latestLedger) {
            return res.status(404).json({
                success: false,
                message:
                    'No ledger records found'
            });
        }

        return res.status(200).json({

            success: true,

            ledger: {

                date:
                    latestLedger.date,

                totalVolumeProcessedUsd:
                    latestLedger.totalVolumeProcessedUsd,

                totalEscrowTransactions:
                    latestLedger.totalEscrowTransactions,

                totalMarketplaceSales:
                    latestLedger.totalMarketplaceSales,

                totalCoinCirculation:
                    latestLedger.totalCoinCirculation,

                totalRegisteredUsers:
                    latestLedger.totalRegisteredUsers,

                totalVerifiedUsers:
                    latestLedger.totalVerifiedUsers,

                vaultStatus:
                    latestLedger.vaultStatus,

                lastAuditAt:
                    latestLedger.lastAuditAt
            }
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                'Failed to retrieve ledger'
        });
    }
};

exports.createLedgerEntry =
async (req, res) => {

    try {

        const ledger =
            await DailyLedger.create({

                date:
                    req.body.date,

                totalVolumeProcessedUsd:
                    req.body.totalVolumeProcessedUsd || 0,

                totalEscrowTransactions:
                    req.body.totalEscrowTransactions || 0,

                totalMarketplaceSales:
                    req.body.totalMarketplaceSales || 0,

                totalCoinCirculation:
                    req.body.totalCoinCirculation || 0,

                totalRegisteredUsers:
                    req.body.totalRegisteredUsers || 0,

                totalVerifiedUsers:
                    req.body.totalVerifiedUsers || 0
            });

        return res.status(201).json({
            success: true,
            ledger
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                'Failed to create ledger entry'
        });
    }
};

exports.updateLedgerMetrics =
async (req, res) => {

    try {

        const ledger =
            await DailyLedger.findById(
                req.params.id
            );

        if (!ledger) {
            return res.status(404).json({
                success: false,
                message:
                    'Ledger not found'
            });
        }

        Object.assign(
            ledger,
            req.body
        );

        ledger.lastAuditAt =
            new Date();

        await ledger.save();

        return res.status(200).json({
            success: true,
            ledger
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                'Failed to update ledger'
        });
    }
};

exports.getVaultStatus =
async (req, res) => {

    try {

        const ledger =
            await DailyLedger
            .findOne()
            .sort({
                createdAt: -1
            })
            .select('+maxLimitCapUsd');

        if (!ledger) {
            return res.status(404).json({
                success: false,
                message:
                    'Ledger not found'
            });
        }

        return res.status(200).json({

            success: true,

            vault: {

                status:
                    ledger.vaultStatus,

                maxLimitCapUsd:
                    ledger.maxLimitCapUsd,

                lastAuditAt:
                    ledger.lastAuditAt
            }
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message:
                'Vault inspection failed'
        });
    }
};
