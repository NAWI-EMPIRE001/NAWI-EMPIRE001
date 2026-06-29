/**
 * ==========================================================
 * NAWI-EMPIRE001 HEALTH MONITOR
 * FILE: monitoring/healthMonitor.js
 * PURPOSE:
 * - Monitor application health
 * - Track MongoDB connectivity
 * - Expose ecosystem metrics
 * ==========================================================
 */

const mongoose = require('mongoose');
const os = require('os');

const getHealthStatus = () => {

    return {
        success: true,

        platform: 'NAWI-EMPIRE001',

        status:
            mongoose.connection.readyState === 1
                ? 'HEALTHY'
                : 'DEGRADED',

        database: {
            connected: mongoose.connection.readyState === 1,
            host: mongoose.connection.host || 'N/A',
            name: mongoose.connection.name || 'N/A'
        },

        server: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuLoad: os.loadavg(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem()
        },

        timestamp: new Date().toISOString()
    };
};

module.exports = {
    getHealthStatus
};