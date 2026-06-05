const Escrow = require('../models/Escrow');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * Create Escrow
 * Diamondback 231 Escrow Shield
 */
exports.createEscrow = async (req, res) => {
    try {

        const {
            sellerId,
            amount,
            productId,
            description,
            sourcePillar
        } = req.body;

        const buyer = await User.findById(req.user.id);

        const seller = await User.findById(sellerId);

        if (!buyer || !seller) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const buyerWallet = await Wallet.findOne({
            user: buyer._id
        });

        if (!buyerWallet) {
            return res.status(404).json({
                success: false,
                message: 'Buyer wallet not found'
            });
        }

        if (buyerWallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        buyerWallet.balance -= amount;
        buyerWallet.escrowBalance += amount;

        await buyerWallet.save();

        const escrow = await Escrow.create({

            transactionId: `ESCROW-${Date.now()}`,

            buyer: buyer._id,

            seller: seller._id,

            productId,

            amount,

            description,

            status: 'HELD',

            escrowMetadata: {
                sourcePillar:
                    sourcePillar || 'GENERAL'
            },

            auditTrail: [
                {
                    action: 'ESCROW_CREATED',
                    actorId: buyer._id.toString()
                }
            ]
        });

        const transaction = await Transaction.create({

            transactionId: `TXN-${Date.now()}`,

            sender: buyer._id,

            receiver: seller._id,

            escrowId: escrow._id,

            transactionType: 'escrow',

            paymentMethod: 'wallet',

            amount,

            status: 'pending',

            destinationModule: 'escrow'
        });

        escrow.relatedTransaction = transaction._id;

        await escrow.save();

        return res.status(201).json({
            success: true,
            message: 'Escrow created successfully',
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
 * Release Escrow
 */
exports.releaseEscrow = async (req, res) => {

    try {

        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
            });
        }

        if (escrow.status !== 'HELD') {
            return res.status(400).json({
                success: false,
                message: 'Escrow already processed'
            });
        }

        const sellerWallet = await Wallet.findOne({
            user: escrow.seller
        });

        if (!sellerWallet) {
            return res.status(404).json({
                success: false,
                message: 'Seller wallet not found'
            });
        }

        sellerWallet.balance += escrow.amount;

        await sellerWallet.save();

        escrow.status = 'RELEASED';

        escrow.releasedAt = new Date();

        escrow.auditTrail.push({
            action: 'ESCROW_RELEASED',
            actorId: req.user.id
        });

        await escrow.save();

        await Transaction.findByIdAndUpdate(
            escrow.relatedTransaction,
            {
                status: 'success'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Funds released successfully',
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
 * Open Dispute
 */
exports.openDispute = async (req, res) => {

    try {

        const { escrowId } = req.params;

        const { reason } = req.body;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
            });
        }

        escrow.status = 'DISPUTED';

        escrow.disputeReason =
            reason || 'No reason provided';

        escrow.disputeOpenedAt = new Date();

        escrow.auditTrail.push({
            action: 'DISPUTE_OPENED',
            actorId: req.user.id,
            notes: reason
        });

        await escrow.save();

        return res.status(200).json({
            success: true,
            message: 'Dispute opened successfully',
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
 * Refund Escrow
 */
exports.refundEscrow = async (req, res) => {

    try {

        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId);

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
            });
        }

        const buyerWallet = await Wallet.findOne({
            user: escrow.buyer
        });

        if (!buyerWallet) {
            return res.status(404).json({
                success: false,
                message: 'Buyer wallet not found'
            });
        }

        buyerWallet.balance += escrow.amount;

        if (buyerWallet.escrowBalance >= escrow.amount) {
            buyerWallet.escrowBalance -= escrow.amount;
        }

        await buyerWallet.save();

        escrow.status = 'REFUNDED';

        escrow.refundedAt = new Date();

        escrow.auditTrail.push({
            action: 'ESCROW_REFUNDED',
            actorId: req.user.id
        });

        await escrow.save();

        await Transaction.findByIdAndUpdate(
            escrow.relatedTransaction,
            {
                status: 'cancelled'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Escrow refunded successfully',
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
 * Get Escrow Status
 */
exports.getEscrowStatus = async (req, res) => {

    try {

        const escrow = await Escrow.findById(
            req.params.escrowId
        )
        .populate('buyer', 'userId email')
        .populate('seller', 'userId email')
        .populate('relatedTransaction');

        if (!escrow) {
            return res.status(404).json({
                success: false,
                message: 'Escrow not found'
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
