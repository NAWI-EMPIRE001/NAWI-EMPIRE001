const Wallet = require('../models/Wallet').Wallet;
const Deposit = require('../models/Deposit');

class DepositService {

    async deposit(userId, amount) {

        const wallet = await Wallet.findOne({ user: userId });

        if (!wallet)
            throw new Error('Wallet not found');

        wallet.coinBalance += amount;

        await wallet.save();

        const record = await Deposit.create({
            user: userId,
            amount,
            status: 'COMPLETED'
        });

        return {
            wallet,
            deposit: record
        };
    }

}

module.exports = new DepositService();