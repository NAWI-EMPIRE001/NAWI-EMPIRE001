// ======================================================
// NAWI-EMPIRE001 WALLET SERVICE
// FILE: services/walletService.js
// ======================================================

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

class WalletService {

    // Fetch wallet by user ID
    static async getWallet(userId) {

        let wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                balance: 0,
                escrowBalance: 0
            });
        }

        return wallet;
    }

    // Deposit coins
    static async deposit(userId, amount) {

        if (amount <= 0)
            throw new Error('Invalid deposit amount');

        const wallet = await this.getWallet(userId);

        wallet.balance += amount;

        await wallet.save();

        await Transaction.create({
            userId,
            type: 'DEPOSIT',
            amount,
            status: 'COMPLETED'
        });

        return wallet;
    }

    // Withdraw coins
    static async withdraw(userId, amount) {

        const wallet = await this.getWallet(userId);

        if (wallet.balance < amount)
            throw new Error('Insufficient balance');

        wallet.balance -= amount;

        await wallet.save();

        await Transaction.create({
            userId,
            type: 'WITHDRAWAL',
            amount,
            status: 'COMPLETED'
        });

        return wallet;
    }

    // Transfer between users
    static async transfer(senderId, receiverId, amount) {

        const sender = await this.getWallet(senderId);
        const receiver = await this.getWallet(receiverId);

        if (sender.balance < amount)
            throw new Error('Insufficient funds');

        sender.balance -= amount;
        receiver.balance += amount;

        await sender.save();
        await receiver.save();

        await Transaction.create({
            userId: senderId,
            receiverId,
            amount,
            type: 'TRANSFER',
            status: 'COMPLETED'
        });

        return true;
    }
}

models.exports = WalletService;
