/**
 * ==========================================================
 * NAWI-EMPIRE001 FRAUD DETECTION ENGINE
 * FILE: security/fraudDetection.js
 * ==========================================================
 */

const detectFraud = ({
    amount = 0,
    transactionCount = 0,
    walletStatus = 'ACTIVE'
}) => {

    let riskScore = 0;

    if (amount > 10000)
        riskScore += 40;

    if (transactionCount > 50)
        riskScore += 30;

    if (walletStatus !== 'ACTIVE')
        riskScore += 50;

    let level = 'LOW';

    if (riskScore >= 70)
        level = 'HIGH';
    else if (riskScore >= 40)
        level = 'MEDIUM';

    return {
        riskScore,
        level,
        flagged: riskScore >= 40
    };
};

module.exports = detectFraud;