const Wallet = require('../models/Wallet').Wallet;
const Withdrawal = require('../models/Withdrawal');

class WithdrawalService {

    async withdraw(userId, amount) {

        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet)
            throw new Error('Wallet not found');

        if (wallet.coinBalance < amount)
            throw new Error('Insufficient balance');

        wallet.coinBalance -= amount;
        wallet.totalWithdrawn += amount;

        await wallet.save();

        const withdrawal = await Withdrawal.create({
            user: userId,
            amount,
            status: 'PENDING'
        });

        return withdrawal;
    }

}

module.exports = new WithdrawalService();