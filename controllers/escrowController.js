/**
 * =========================================================
 * NAWI-EMPIRE001 ESCROW ENGINE
 * FINTECH-GRADE ACID PROTECTED WORKFLOWS
 * FILE: controllers/escrowController.js
 * =========================================================
 */

const mongoose = require('mongoose');
const Escrow = require('../models/Escrow');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const DailyLedger = require('../models/DailyLedger');

/**
 * =========================================================
 * CREATE ESCROW CONTRACT
 * =========================================================
 */
exports.createEscrow = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        // Support both body property naming conventions cleanly
        const { 
            sellerId, 
            receiverId, 
            amount, 
            productId, 
            description, 
            sourcePillar, 
            pillar 
        } = req.body;

        const finalSellerId = sellerId || receiverId;
        const targetPillar = sourcePillar || pillar || 'SOVEREIGN_EXCHANGE';

        if (!finalSellerId || !amount || amount <= 0) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Valid recipient and amount parameters required.' });
        }

        const buyer = await User.findById(req.user.id).session(session);
        const seller = await User.findById(finalSellerId).session(session);

        if (!buyer || !seller) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer or Seller user record not found.' });
        }

        const buyerWallet = await Wallet.findOne({ user: buyer._id }).session(session);
        if (!buyerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer wallet engine instance not found.' });
        }

        // Lock funds inside buyer's wallet escrow reserve via model schema wrapper methods
        await buyerWallet.lockEscrow(Number(amount), targetPillar);

        const escrowIdString = `ESCROW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const [escrowRecord] = await Escrow.create([{
            transactionId: escrowIdString,
            buyer: buyer._id,
            seller: seller._id,
            productId: productId || null,
            amount: Number(amount),
            description: description || '',
            status: 'LOCKED', // Unified to matching status schema enum
            sourcePillar: targetPillar,
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
            amount: Number(amount),
            status: 'pending',
            destinationModule: 'escrow',
            hub_destination: 'marketplace',
            gift_type: 'DIRECT_SUPPORT',
            empire_coins_spent: Number(amount)
        }], { session });

        escrowRecord.relatedTransaction = transactionRecord._id;
        await escrowRecord.save({ session });

        // Safely log transactional footprints inside the daily system ledger
        if (DailyLedger && typeof DailyLedger.logSystemTransaction === 'function') {
            await DailyLedger.logSystemTransaction({
                type: 'ESCROW_LOCK',
                amount: Number(amount),
                currency: 'COIN',
                status: 'VERIFIED',
                sourcePillar: targetPillar
            });
        }

        await session.commitTransaction();
        return res.status(201).json({
            success: true,
            message: 'Escrow channel locked and secured successfully.',
            escrow: escrowRecord
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * =========================================================
 * RELEASE ESCROW (SELLER Payout Settlement)
 * =========================================================
 */
exports.releaseEscrow = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const escrowId = req.params.id || req.params.escrowId;

        const escrow = await Escrow.findById(escrowId).session(session);
        if (!escrow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Escrow contract reference not found.' });
        }

        // Check if user is either the buyer or our absolute root system administrator footprint
        const isBuyer = escrow.buyer.toString() === req.user.id;
        const isSystemAdmin = process.env.SYSTEM_ADMIN_ID && req.user.id === process.env.SYSTEM_ADMIN_ID;

        if (!isBuyer && !isSystemAdmin) {
            await session.abortTransaction();
            return res.status(403).json({ success: false, message: 'Unauthorized execution privileges.' });
        }

        if (escrow.status === 'COMPLETED' || escrow.status === 'RELEASED') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Escrow state immutable: Channel already settled.' });
        }

        const buyerWallet = await Wallet.findOne({ user: escrow.buyer }).session(session);
        const sellerWallet = await Wallet.findOne({ user: escrow.seller }).session(session);

        if (!buyerWallet || !sellerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Financial ledger interfaces missing.' });
        }

        if (buyerWallet.escrowBalance < escrow.amount) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Critical Error: Out of sync account ledger variance.' });
        }

        // Process actual movement of capital out of buyer escrow and straight to liquid seller balance
        buyerWallet.escrowBalance -= escrow.amount;
        await buyerWallet.save({ session });

        await sellerWallet.credit(escrow.amount, escrow.sourcePillar || 'GENERAL');

        escrow.status = 'COMPLETED';
        escrow.completedAt = new Date();
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

        if (DailyLedger && typeof DailyLedger.logSystemTransaction === 'function') {
            await DailyLedger.logSystemTransaction({
                type: 'ESCROW_RELEASE',
                amount: escrow.amount,
                currency: 'COIN',
                status: 'VERIFIED',
                sourcePillar: escrow.sourcePillar || 'GENERAL'
            });
        }

        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: 'Escrow settlement released successfully.',
            escrow
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * =========================================================
 * OPEN ESCROW DISPUTE
 * =========================================================
 */
exports.openDispute = async (req, res, next) => {
    try {
        const escrowId = req.params.id || req.params.escrowId;
        const { reason } = req.body;

        const escrow = await Escrow.findById(escrowId);
        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow instance reference not found.' });
        }

        if (escrow.status !== 'LOCKED') {
            return res.status(400).json({ success: false, message: 'Cannot declare dispute on settled lines.' });
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

        return res.status(200).json({
            success: true,
            message: 'Escrow flagged for manual dispute governance review.',
            escrow
        });

    } catch (error) {
        next(error);
    }
};

/**
 * =========================================================
 * CANCEL / REFUND ESCROW (BUYER Gets Rolled Back)
 * =========================================================
 */
exports.cancelEscrow = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const escrowId = req.params.id || req.params.escrowId;

        const escrow = await Escrow.findById(escrowId).session(session);
        if (!escrow) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Escrow record reference not found.' });
        }

        if (escrow.status !== 'LOCKED' && escrow.status !== 'DISPUTED') {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: 'Escrow allocations cannot be rolled back from current state.' });
        }

        const buyerWallet = await Wallet.findOne({ user: escrow.buyer }).session(session);
        if (!buyerWallet) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Buyer target financial interface not found.' });
        }

        // Safe execution context of method wrappers to return the frozen balance
        if (typeof buyerWallet.refundEscrow === 'function') {
            await buyerWallet.refundEscrow(escrow.amount, escrow.sourcePillar || 'GENERAL');
        } else {
            // Direct structural backup fallback if method wrappers are isolated elsewhere
            if (buyerWallet.escrowBalance < escrow.amount) {
                await session.abortTransaction();
                return res.status(400).json({ success: false, message: 'Insufficient escrow pool depth for balance execution.' });
            }
            buyerWallet.escrowBalance -= escrow.amount;
            buyerWallet.balance += escrow.amount;
            buyerWallet.transactionHistory.push({
                transactionReference: `RF-${Date.now()}`,
                type: 'REFUND',
                amount: escrow.amount,
                description: 'Escrow alignment cancellation refund.'
            });
            await buyerWallet.save({ session });
        }

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

        if (DailyLedger && typeof DailyLedger.logSystemTransaction === 'function') {
            await DailyLedger.logSystemTransaction({
                type: 'ESCROW_REFUND',
                amount: escrow.amount,
                currency: 'COIN',
                status: 'VERIFIED',
                sourcePillar: escrow.sourcePillar || 'GENERAL'
            });
        }

        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: 'Escrow allocation safely rolled back to buyer wallet balance.',
            escrow
        });

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        await session.endSession();
    }
};

/**
 * =========================================================
 * GET USER ESCROWS (BUYER & SELLER MIXED VIEWS)
 * =========================================================
 */
exports.getMyEscrows = async (req, res, next) => {
    try {
        const escrows = await Escrow.find({
            $or: [
                { buyer: req.user.id },
                { seller: req.user.id }
            ]
        })
        .populate('buyer', 'username profilePhoto email')
        .populate('seller', 'username profilePhoto email')
        .populate('relatedTransaction')
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: escrows.length,
            escrows
        });

    } catch (error) {
        next(error);
    }
};

/**
 * =========================================================
 * GET SINGLE ESCROW STATUS DETAILS
 * =========================================================
 */
exports.getEscrowStatus = async (req, res, next) => {
    try {
        const escrowId = req.params.id || req.params.escrowId;
        const escrow = await Escrow.findById(escrowId)
            .populate('buyer', 'username profilePhoto email')
            .populate('seller', 'username profilePhoto email')
            .populate('relatedTransaction');

        if (!escrow) {
            return res.status(404).json({ success: false, message: 'Escrow allocation reference link missing.' });
        }

        return res.status(200).json({ success: true, escrow });

    } catch (error) {
        next(error);
    }
};
