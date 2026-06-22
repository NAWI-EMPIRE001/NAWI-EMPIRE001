2!%// ======================================================
// 👑 NAWI-EMPIRE001 - CENTRALIZED LOGGER ENGINE
// FILE: utils/logger.js
// PURPOSE: System-wide logging & audit tracking
// ======================================================

const fs = require('fs');
const path = require('path');

// ======================================================
// LOG DIRECTORY INITIALIZATION
// ======================================================

const logDirectory = path.join(__dirname, '../logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// ======================================================
// INTERNAL LOG WRITER
// ======================================================

const writeLog = (level, message, metadata = {}) => {

    const timestamp = new Date().toISOString();

    const logEntry = {
        timestamp,
        level,
        message,
        metadata
    };

    const logFile = path.join(
        logDirectory,
        `${new Date().toISOString().split('T')[0]}.log`
    );

    const formattedLog =
        JSON.stringify(logEntry) + '\n';

    fs.appendFile(
        logFile,
        formattedLog,
        (err) => {
            if (err) {
                console.error(
                    '❌ Failed writing log:',
                    err.message
                );
            }
        }
    );

    // Console output for Render / development
    switch (level) {

        case 'INFO':
            console.log(`🟢 ${message}`);
            break;

        case 'WARN':
            console.warn(`🟡 ${message}`);
            break;

        case 'ERROR':
            console.error(`🔴 ${message}`);
            break;

        case 'SECURITY':
            console.warn(`🛡️ SECURITY: ${message}`);
            break;

        case 'AUDIT':
            console.log(`📋 AUDIT: ${message}`);
            break;

        default:
            console.log(message);
    }
};

// ======================================================
// PUBLIC LOGGER API
// ======================================================

const logger = {

    info: (message, metadata = {}) => {
        writeLog('INFO', message, metadata);
    },

    warn: (message, metadata = {}) => {
        writeLog('WARN', message, metadata);
    },

    error: (message, metadata = {}) => {
        writeLog('ERROR', message, metadata);
    },

    security: (message, metadata = {}) => {
        writeLog('SECURITY', message, metadata);
    },

    audit: (message, metadata = {}) => {
        writeLog('AUDIT', message, metadata);
    }
};

module.exports = logger;