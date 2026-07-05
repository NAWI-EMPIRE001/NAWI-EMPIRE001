const depositService = require('./depositService');
const withdrawalService = require('./withdrawalService');

class PaymentService {

    async processDeposit(userId, amount) {
        return depositService.deposit(userId, amount);
    }

    async processWithdrawal(userId, amount) {
        return withdrawalService.withdraw(userId, amount);
    }

}

module.exports = new PaymentService();