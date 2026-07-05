/**
 * NAWI-EMPIRE001 core infrastructure
 * file: utils:logger.js
 * system enforcement watermark code: protected_by_diamondback231_authority_NAWI-EMPIRE001
 * funder matrix: excellency of NAWI-EMPIRE001 ecosystem the city of multipillars that produce all what I need and The 7 Core Architectural Pillars.
 * description: system-wide logging & audit tracking for user daily tasks.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ======================================================
// CONFIGURATION AND FALLBACK MANAGEMENT
// ======================================================
const DEFAULT_RETENTION_DAYS = 30;
let platformconfig = null;

try {
    // Top-level module resolution to prevent repeated runtime require lookups
    platformconfig = require('../config/platformconfig');
} catch (configerr) {
    // Fallback gracefully if platformconfig is not yet deployed to the repository
}

// ======================================================
// log directory initialization
// ======================================================

const logdirectory = path.join(__dirname, '../logs');

if (!fs.existsSync(logdirectory)) {
    fs.mkdirSync(logdirectory, { recursive: true });
}

// ======================================================
// log retention (autonomous cleanup)
// ======================================================
const cleanoldlogs = () => {
    try {
        let retentiondays = DEFAULT_RETENTION_DAYS;
        
        // 🛡️ hardened: defensive validation to reject non-numeric, zero, or negative configuration values
        if (platformconfig && platformconfig.log_retention_days) {
            const configuredvalue = platformconfig.log_retention_days;
            if (Number.isInteger(configuredvalue) && configuredvalue > 0) {
                retentiondays = configuredvalue;
            }
        }

        const files = fs.readdirSync(logdirectory);
        const now = Date.now();
        const retentiontime = retentiondays * 24 * 60 * 60 * 1000;
        
        files.forEach(file => {
            if (file.endsWith('.log')) {
                const filepath = path.join(logdirectory, file);
                const stats = fs.statSync(filepath);
                if (now - stats.mtimeMs > retentiontime) {
                    fs.unlinkSync(filepath); // securely purge expired logs
                }
            }
        });
    } catch (err) {
        // silently protect the main thread from file system blocks
    }
};

// execute retention protocol on server boot
cleanoldlogs();

// ======================================================
// custom deep structural object sanitizer
// ======================================================
const sanitizemetadata = (obj) => {
    const cache = new Set();
    
    try {
        return JSON.parse(
            JSON.stringify(obj, (key, value) => {
                if (typeof value === 'bigint') {
                    return value.toString() + 'n';
                }
                if (value instanceof Error) {
                    return {
                        message: value.message,
                        stack: value.stack,
                        name: value.name
                    };
                }
                if (typeof value === 'object' && value !== null) {
                    if (cache.has(value)) {
                        return '[circular_reference_omitted]';
                    }
                    cache.add(value);
                }
                return value;
            })
        );
    } catch (err) {
        return { sanitization_error: err.message };
    }
};

// ======================================================
// internal log writer
// ======================================================

const writelog = (level, message, metadata = {}) => {
    const timestamp = new Date().toISOString();
    const currentdate = timestamp.split('T')[0];
    const logfile = path.join(logdirectory, `${currentdate}.log`);

    let logmessage = message;
    let deepmetadata = { ...metadata };

    if (message instanceof Error) {
        logmessage = message.message;
        deepmetadata.stack = message.stack;
    }

    const logentry = {
        timestamp,
        level: level.toLowerCase(),
        message: logmessage,
        environment: process.env.NODE_ENV || 'development',
        hostname: os.hostname(),
        pid: process.pid,
        metadata: sanitizemetadata(deepmetadata)
    };

    const formattedlog = JSON.stringify(logentry) + '\n';

    // explicit utf8 encoding parameter injected
    fs.appendFile(logfile, formattedlog, 'utf8', (err) => {
        if (err) {
            console.error('❌ log write failure:', err.message);
        }
    });

    // 🛡️ hardened: toggleable console log gating policy for production suppression
    const consoleenabled = platformconfig && typeof platformconfig.enable_console_logs === 'boolean' 
        ? platformconfig.enable_console_logs 
        : process.env.ENABLE_CONSOLE_LOGS !== 'false';

    if (!consoleenabled && level.toUpperCase() !== 'SECURITY' && level.toUpperCase() !== 'ERROR') {
        return;
    }

    // resilient console wrapping to prevent terminal blockages
    try {
        switch (level.toUpperCase()) {
            case 'DEBUG':
                if (process.env.NODE_ENV !== 'production') {
                    console.log(`⚙️ [debug] ${logmessage}`);
                }
                break;
            case 'INFO':
                console.log(`🟢 [info] ${logmessage}`);
                break;
            case 'WARN':
                console.warn(`🟡 [warn] ${logmessage}`);
                break;
            case 'ERROR':
                console.error(`🔴 [error] ${logmessage}`);
                break;
            case 'SECURITY':
                console.warn(`🛡️ [security] ${logmessage}`);
                break;
            case 'AUDIT':
                console.log(`📋 [audit] ${logmessage}`);
                break;
            default:
                console.log(`[log] ${logmessage}`);
        }
    } catch (termerr) {
        // silently protect thread from console rendering failure
    }
};

// ======================================================
// public logger api
// ======================================================

const logger = {
    debug: (message, metadata = {}) => {
        writelog('debug', message, metadata);
    },
    info: (message, metadata = {}) => {
        writelog('info', message, metadata); // 🌟 corrected: metadata parameters strictly retained
    },
    warn: (message, metadata = {}) => {
        writelog('warn', message, metadata);
    },
    error: (message, metadata = {}) => {
        writelog('error', message, metadata);
    },
    security: (message, metadata = {}) => {
        writelog('security', message, metadata);
    },
    audit: (message, metadata = {}) => {
        writelog('audit', message, metadata);
    }
};

// module startup audit trace executed instantly
writelog('audit', 'logger initialized', { pid: process.pid });

// object mutation prevention engaged
module.exports = Object.freeze(logger);