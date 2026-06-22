// ======================================================
// NAWI-EMPIRE001 ESCROW SERVICE
// FILE: services/escrowService.js
// ======================================================

const Escrow = require('../models/Escrow');
const WalletService = require('./walletService');

class EscrowService {

    // Create Escrow
    static async createEscrow(
        buyerId,
        sellerId,
        amount,
        itemId
    ) {

        const buyerWallet =
            await WalletService.getWallet(buyerId);

        if (buyerWallet.balance < amount) {
            throw new Error('Insufficient balance');
        }

        buyerWallet.balance -= amount;
        buyerWallet.escrowBalance += amount;

        await buyerWallet.save();

        const escrow = await Escrow.create({
            buyerId,
            sellerId,
            itemId,
            amount,
            status: 'HELD_IN_ESCROW'
        });

        return escrow;
    }

    // Release Escrow
    static async releaseEscrow(escrowId) {

        const escrow =
            await Escrow.findById(escrowId);

        if (!escrow)
            throw new Error('Escrow not found');

        if (escrow.status !== 'HELD_IN_ESCROW')
            throw new Error('Invalid escrow state');

        const sellerWallet =
            await WalletService.getWallet(
                escrow.sellerId
            );

        sellerWallet.balance += escrow.amount;

        await sellerWallet.save();

        escrow.status = 'RELEASED';
        escrow.releasedAt = Date.now();

        await escrow.save();

        return escrow;
    }

    // Refund Escrow
    static async refundEscrow(escrowId) {

        const escrow =
            await Escrow.findById(escrowId);

        if (!escrow)
            throw new Error('Escrow not found');

        const buyerWallet =
            await WalletService.getWallet(
                escrow.buyerId
            );

        buyerWallet.balance += escrow.amount;
        buyerWallet.escrowBalance -= escrow.amount;

        await buyerWallet.save();

        escrow.status = 'REFUNDED';

        await escrow.save();

        return escrow;
    }
}

module.exports = EscrowService;
