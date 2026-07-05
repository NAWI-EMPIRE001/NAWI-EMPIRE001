/**
 * ==========================================================
 * NAWI-EMPIRE001 AUDIT LOGGER
 * FILE: security/auditLogger.js
 * ==========================================================
 */

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const auditLog = async ({
    actorId = null,
    action = 'UNKNOWN',
    target = null,
    status = 'SUCCESS',
    metadata = {}
}) => {

    const payload = {
        actorId,
        action,
        target,
        status,
        metadata,
        timestamp: new Date().toISOString()
    };

    const file = path.join(
        logsDir,
        `audit-${new Date().toISOString().split('T')[0]}.log`
    );

    fs.appendFileSync(
        file,
        JSON.stringify(payload) + '\n'
    );

    return payload;
};

module.exports = auditLog;