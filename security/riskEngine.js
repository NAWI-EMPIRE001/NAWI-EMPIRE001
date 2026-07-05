const fraudDetection = require('./fraudDetection');

class RiskEngine {

    calculateRisk(user, wallet) {

        let score = 0;

        if (fraudDetection.detectSuspiciousWalletActivity(wallet))
            score += 40;

        if (wallet.walletStatus === 'RESTRICTED')
            score += 30;

        if (wallet.walletStatus === 'FROZEN')
            score += 100;

        return {
            score,
            level:
                score >= 80
                    ? 'CRITICAL'
                    : score >= 50
                    ? 'HIGH'
                    : score >= 20
                    ? 'MEDIUM'
                    : 'LOW'
        };
    }

}

module.exports = new RiskEngine();