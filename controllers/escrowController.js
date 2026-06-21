const mongoose = require('mongoose');
const Escrow = require('../models/Escrow');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DailyLedger = require('../models/DailyLedger');

/**
 * =========================================================
 * NAWI-EMPIRE001 ESCROW ENGINE
 * FINTECH-GRADE ACID PROTECTED WORKFLOWS
 * =========================================================
 */

/**
 * CREATE ESCROW
 */
exports.createEscrow = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        const { sellerId, amount, productId, description, sourcePillar } = req.body;
        const targetPillar = sourcePillar || 'GENERAL';

        const buyer = await User.findById(req.user.id).session(session);
        const seller = await User.findById(sellerId).session(session);

        if (!buyer || !seller) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer or Seller user record not found' });
        }

        const buyerWallet = await Wallet.findOne({ user: buyer._id }).session(session);
        if (!buyerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer wallet engine instance not found' });
        }

        // Use core unified Wallet.js hook execution to handle state verification & balance checks safely
        await buyerWallet.lockEscrow(amount, targetPillar);

        const escrowIdString = `ESCROW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const [escrowRecord] = await Escrow.create([{
            transactionId: escrowIdString,
            buyer: buyer._id,
            seller: seller._id,
            productId,
            amount,
            description,
            status: 'HELD',
            escrowMetadata: { sourcePillar: targetPillar },
            auditTrail: [{
                action: 'ESCROW_CREATED',
                actorId: buyer._id.toString(),
                timestamp: new Date()
            }]
        }], { session });

        const [transactionRecord] = await Transaction.create([{
            transactionId: `TXN-${Date.now()}`,
            sender: buyer._id,
            receiver: seller._id,
            escrowId: escrowRecord._id,
            transactionType: 'escrow',
            paymentMethod: 'wallet',
            amount,
            status: 'pending',
            destinationModule: 'escrow',
            hub_destination: 'marketplace',
            gift_type: 'DIRECT_SUPPORT',
            empire_coins_spent: amount
        }], { session });

        escrowRecord.relatedTransaction = transactionRecord._id;
        await escrowRecord.save({ session });

        // Synchronize Global Daily Reconciliation Ledger Ecosystem Status atomically
        await DailyLedger.logSystemTransaction({
            type: 'ESCROW_LOCK',
            amount,
            currency: 'COIN',
            status: 'VERIFIED',
            sourcePillar: targetPillar
        });

        await session.commitTransaction();
        return res.status(201).json({
            success: true,
            message: 'Escrow channel locked and secured successfully',
            escrow: escrowRecord
        });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * RELEASE ESCROW (SELLER GETS PAID)
 */
exports.releaseEscrow = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId).session(session);
        if (!escrow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Escrow contract not found' });
        }

        if (escrow.status !== 'HELD') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Escrow state immutable: Not in HELD status' });
        }

        const buyerWallet = await Wallet.findOne({ user: escrow.buyer }).session(session);
        const sellerWallet = await Wallet.findOne({ user: escrow.seller }).session(session);

        if (!buyerWallet || !sellerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Financial endpoints for balance distribution missing' });
        }

        // Deduct from buyer's escrow pool and assign straight to seller's core liquid wallet balance safely
        if (buyerWallet.escrowBalance < escrow.amount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Critical Error: Out of sync account ledger variance' });
        }
        buyerWallet.escrowBalance -= escrow.amount;
        await buyerWallet.save({ session });

        await sellerWallet.credit(escrow.amount, escrow.escrowMetadata?.sourcePillar || 'GENERAL');

        escrow.status = 'RELEASED';
        escrow.releasedAt = new Date();
        escrow.auditTrail.push({
            action: 'ESCROW_RELEASED',
            actorId: req.user.id,
            timestamp: new Date()
        });
        await escrow.save({ session });

        await Transaction.findByIdAndUpdate(
            escrow.relatedTransaction,
            { status: 'success' },
            { session }
        );

        await DailyLedger.logSystemTransaction({
            type: 'ESCROW_RELEASE',
            amount: escrow.amount,
            currency: 'COIN',
            status: 'VERIFIED',
            sourcePillar: escrow.escrowMetadata?.sourcePillar || 'GENERAL'
        });

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Escrow settlement released successfully', escrow });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * OPEN DISPUTE
 */
exports.openDispute = async (req, res) => {
    try {
        const { escrowId } = req.params;
        const { reason } = req.body;

        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow instance not found' });
        }

        if (escrow.status !== 'HELD') {
            return res.status(400).json({ success: false, message: 'Cannot declare dispute on settled lines' });
        }

        escrow.status = 'DISPUTED';
        escrow.disputeReason = reason || 'No details specified';
        escrow.disputeOpenedAt = new Date();
        escrow.auditTrail.push({
            action: 'DISPUTE_OPENED',
            actorId: req.user.id,
            notes: reason,
            timestamp: new Date()
        });
        await escrow.save();

        return res.status(200).json({ success: true, message: 'Escrow flagged for manual dispute governance review', escrow });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * REFUND ESCROW (BUYER GETS MONEY BACK)
 */
exports.refundEscrow = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const { escrowId } = req.params;

        const escrow = await Escrow.findById(escrowId).session(session);
        if (!escrow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Escrow record not found' });
        }

        if (escrow.status !== 'HELD' && escrow.status !== 'DISPUTED') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Escrow cannot be returned from its current state' });
        }

        const buyerWallet = await Wallet.findOne({ user: escrow.buyer }).session(session);
        if (!buyerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer target financial interface not found' });
        }

        // Return the locked funds back up into liquid coinBalance using our model instance wrapper
        await buyerWallet.refundEscrow(escrow.amount, escrow.escrowMetadata?.sourcePillar || 'GENERAL');

        escrow.status = 'REFUNDED';
        escrow.refundedAt = new Date();
        escrow.auditTrail.push({
            action: 'ESCROW_REFUNDED',
            actorId: req.user.id,
            timestamp: new Date()
        });
        await escrow.save({ session });

        await Transaction.findByIdAndUpdate(
            escrow.relatedTransaction,
            { status: 'cancelled' },
            { session }
        );

        await DailyLedger.logSystemTransaction({
            type: 'ESCROW_REFUND',
            amount: escrow.amount,
            currency: 'COIN',
            status: 'VERIFIED',
            sourcePillar: escrow.escrowMetadata?.sourcePillar || 'GENERAL'
        });

        await session.commitTransaction();
        return res.status(200).json({ success: true, message: 'Escrow allocation safely rolled back to buyer wallet', escrow });

    } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        await session.endSession();
    }
};

/**
 * GET ESCROW STATUS
 */
exports.getEscrowStatus = async (req, res) => {
    try {
        const escrow = await Escrow.findById(req.params.escrowId)
            .populate('buyer', 'userId email')
            .populate('seller', 'userId email')
            .populate('relatedTransaction');

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow allocation reference link missing' });
        }

        return res.status(200).json({ success: true, escrow });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
