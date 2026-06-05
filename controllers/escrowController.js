const Escrow = require('../models/Escrow');
const User = require('../models/User');

/**
 * Create escrow transaction
 */
exports.createEscrow = async (req, res) => {
    try {
        const {
            sellerId,
            amount,
            productId,
            description
        } = req.body;

        if (!sellerId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Seller ID and amount are required.'
            });
        }

        const buyer = await User.findOne({
            userId: req.user.userId
        });

        const seller = await User.findOne({
            userId: sellerId
        });

        if (!buyer || !seller) {
            return res.status(404).json({
                success: false,
                message: 'User record not found.'
            });
        }

        if (buyer.wallet.empire_coins < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient Empire Coins.'
            });
        }

        buyer.wallet.empire_coins -= amount;
        await buyer.save();

        const escrow = await Escrow.create({
            transactionId: `ESCROW-${Date.now()}`,
            buyerId: buyer.userId,
            sellerId: seller.userId,
            amount,
            productId,
            description,
            status: 'PENDING'
        });

        return res.status(201).json({
            success: true,
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Release escrow funds
 */
exports.releaseEscrow = async (req, res) => {
    try {
        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found.'
            });
        }

        if (escrow.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Escrow already processed.'
            });
        }

        const seller = await User.findOne({
            userId: escrow.sellerId
        });

        if (!seller) {
            return res.status(404).json({
                success: false,
                message: 'Seller not found.'
            });
        }

        seller.wallet.empire_coins += escrow.amount;
        seller.wallet.total_earned_to_date += escrow.amount;

        await seller.save();

        escrow.status = 'RELEASED';
        escrow.releasedAt = new Date();

        await escrow.save();

        return res.status(200).json({
            success: true,
            message: 'Escrow released.',
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Open dispute
 */
exports.openDispute = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { reason } = req.body;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found.'
            });
        }

        escrow.status = 'DISPUTED';
        escrow.disputeReason = reason || 'No reason provided';

        await escrow.save();

        return res.status(200).json({
            success: true,
            message: 'Dispute opened.',
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Refund escrow
 */
exports.refundEscrow = async (req, res) => {
    try {
        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found.'
            });
        }

        const buyer = await User.findOne({
            userId: escrow.buyerId
        });

        if (!buyer) {
            return res.status(404).json({
                success: false,
                message: 'Buyer not found.'
            });
        }

        buyer.wallet.empire_coins += escrow.amount;
        await buyer.save();

        escrow.status = 'REFUNDED';
        escrow.refundedAt = new Date();

        await escrow.save();

        return res.status(200).json({
            success: true,
            message: 'Escrow refunded.',
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get escrow details
 */
exports.getEscrowStatus = async (req, res) => {
    try {
        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow record not found.'
            });
        }

        return res.status(200).json({
            success: true,
            escrow
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
