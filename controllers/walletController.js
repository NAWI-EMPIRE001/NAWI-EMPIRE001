/**
 * =========================================================
 * NAWI-EMPIRE001 WALLET LEDGER CONTROLLER
 * PRODUCTION CORE ENGINE - FINTECH CONCURRENCY ARCHITECTURE
 * FILE: controllers/walletController.js
 * =========================================================
 */

const mongoose = require('mongoose');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

/**
 * =========================================================
 * GET WALLET BALANCE & PROFILE STATE
 * =========================================================
 */
exports.getWalletBalance = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Wallet instance not found for this user.'
            });
        }

        return res.status(200).json({
            success: true,
            wallet
        });
    } catch (error) {
        next(error);
    }
};

// Aliased helper to match alternate router registrations cleanly
exports.getWallet = exports.getWalletBalance;

/**
 * =========================================================
 * SYSTEM ADMIN COIN DEPOSIT (CREDIT)
 * =========================================================
 */
exports.depositCoins = async (req, res, next) => {
    try {
        const { amount, sourcePillar = 'GENERAL', pillar } = req.body;
        const targetPillar = pillar || sourcePillar;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid deposit amount specified.'
            });
        }

        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Target wallet engine instance not found.'
            });
        }

        // Use core model instance wrapper method to safely mutate balance and history array
        await wallet.credit(Number(amount), `Admin Deposit via ${targetPillar}`);

        // Maintain the global transaction log trail asynchronously
        await Transaction.create({
            sender: req.user.id,
            receiver: req.user.id,
            transactionType: 'deposit',
            paymentMethod: 'system',
            amount: Number(amount),
            status: 'success',
            destinationModule: 'wallet',
            hub_destination: targetPillar.toLowerCase()
        }).catch(err => console.error('Non-blocking transaction logging failure:', err));

        return res.status(200).json({
            success: true,
            message: 'Wallet credited successfully.',
            balance: wallet.balance,
            ecBalance: wallet.ecBalance
        });
    } catch (error) {
        next(error);
    }
};

// Aliased helper to sync with Code 2 configuration profiles
exports.creditWallet = exports.depositCoins;

/**
 * =========================================================
 * WALLET DEBIT ENGINE
 * =========================================================
 */
exports.debitWallet = async (req, res, next) => {
    try {
        const { amount, sourcePillar = 'GENERAL', pillar } = req.body;
        const targetPillar = pillar || sourcePillar;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid debit amount specified.'
            });
        }

        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Target wallet engine instance not found.'
            });
        }

        // Safe debit checking rules built directly into our core model logic
        await wallet.debit(Number(amount), `Direct Platform Debit via ${targetPillar}`);

        return res.status(200).json({
            success: true,
            message: 'Wallet debited successfully.',
            balance: wallet.balance,
            ecBalance: wallet.ecBalance
        });
    } catch (error) {
        next(error);
    }
};

/**
 * =========================================================
 * PEER-TO-PEER COIN TRANSFER (ACID ISOLATED)
 * =========================================================
 */
exports.transferCoins = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();

        const { receiverId, amount, description = 'Peer transfer' } = req.body;

        if (!receiverId || !amount || Number(amount) <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Valid receiver identity parameters and positive amount thresholds required.'
            });
        }

        if (receiverId.toString() === req.user.id.toString()) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Self-transfers are locked on this ecosystem route.'
            });
        }

        const senderWallet = await Wallet.findOne({ user: req.user.id }).session(session);
        const receiverWallet = await Wallet.findOne({ user: receiverId }).session(session);

        if (!senderWallet || !receiverWallet) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'One or more system financial endpoints could not be located.'
            });
        }

        // Transaction balance guard checks executed inside database context
        if (senderWallet.balance < Number(amount)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Insufficient liquid platform balance for operation.'
            });
        }

        // Execution of balances using atomic decrements/credits
        senderWallet.balance -= Number(amount);
        senderWallet.transactionHistory.push({
            transactionReference: `TX-OUT-${Date.now()}`,
            type: 'PURCHASE',
            amount: Number(amount),
            description: `Transfer out to recipient Account: ${receiverId}`
        });
        await senderWallet.save({ session });

        receiverWallet.balance += Number(amount);
        receiverWallet.totalEarned += Number(amount);
        receiverWallet.transactionHistory.push({
            transactionReference: `TX-IN-${Date.now()}`,
            type: 'DEPOSIT',
            amount: Number(amount),
            description: `P2P incoming support from User: ${req.user.id}`
        });
        await receiverWallet.save({ session });

        // Generate complete global log document attached cleanly to this session block
        await Transaction.create([{
            sender: req.user.id,
            receiver: receiverId,
            transactionType: 'transfer',
            paymentMethod: 'wallet',
            amount: Number(amount),
            status: 'success',
            destinationModule: 'wallet',
            hub_destination: 'sovereign_exchange',
            description
        }], { session });

        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: 'Ecosystem transfer completed and settled successfully.',
            balance: senderWallet.balance
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
 * LIQUIDITY ESCROW CONVERSION REQUEST (WITHDRAWAL)
 * =========================================================
 */
exports.withdrawCoins = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        await session.startTransaction();
        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'A valid numerical withdrawal threshold is required.'
            });
        }

        const wallet = await Wallet.findOne({ user: req.user.id }).session(session);

        if (!wallet) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Active system wallet reference link not found.'
            });
        }

        if (wallet.balance < Number(amount)) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Insufficient liquid asset depth to fulfill conversion request.'
            });
        }

        // Lock funds away into escrow balances internally while compliance workflows process payouts
        wallet.balance -= Number(amount);
        wallet.escrowBalance += Number(amount);
        
        wallet.transactionHistory.push({
            transactionReference: `WD-INIT-${Date.now()}`,
            type: 'ESCROW_LOCK',
            amount: Number(amount),
            description: 'Conversion withdrawal pipeline initializing escrow assignment.'
        });
        await wallet.save({ session });

        await Transaction.create([{
            sender: req.user.id,
            receiver: req.user.id,
            transactionType: 'withdrawal',
            paymentMethod: 'wallet',
            amount: Number(amount),
            status: 'pending',
            destinationModule: 'escrow',
            hub_destination: 'sovereign_exchange'
        }], { session });

        await session.commitTransaction();
        return res.status(200).json({
            success: true,
            message: 'Conversion withdrawal pipeline initialized successfully.',
            balance: wallet.balance,
            escrowBalance: wallet.escrowBalance
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
 * FETCH COMPLETE USER TRANSACTION HISTORY
 * =========================================================
 */
exports.getWalletHistory = async (req, res, next) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({
                success: false,
                message: 'Target wallet engine instance not found.'
            });
        }

        // Sort our embedded schema array in descending chronological runtime order
        const transactions = wallet.transactionHistory.sort((a, b) => b.createdAt - a.createdAt);

        return res.status(200).json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        next(error);
    }
};

// Aliased sub-profile helpers to sync with Code 2 route attachments
exports.getTransactions = exports.getWalletHistory;
