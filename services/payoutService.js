// ======================================================
// NAWI-EMPIRE001 PAYOUT SERVICE
// FILE: services/payoutService.js
// ======================================================

const WalletService = require('./walletService');
const Transaction = require('../models/Transaction');

class PayoutService {

    static async processPayout(
        userId,
        amount
    ) {

        const wallet =
            await WalletService.getWallet(userId);

        if (wallet.balance < amount) {
            throw new Error(
                'Insufficient balance for payout'
            );
        }

        wallet.balance -= amount;

        await wallet.save();

        const payout = await Transaction.create({
            userId,
            amount,
            type: 'PAYOUT',
            status: 'PROCESSING'
        });

        return {
            success: true,
            payout
        };
    }

    static async completePayout(transactionId) {

        const payout =
            await Transaction.findById(transactionId);

        if (!payout)
            throw new Error('Payout not found');

        payout.status = 'COMPLETED';

        await payout.save();

        return payout;
    }

    static async rejectPayout(
        transactionId,
        reason
    ) {

        const payout =
            await Transaction.findById(transactionId);

        if (!payout)
            throw new Error('Payout not found');

        payout.status = 'REJECTED';
        payout.reason = reason;

        await payout.save();

        return payout;
    }
}

module.exports = PayoutService;
