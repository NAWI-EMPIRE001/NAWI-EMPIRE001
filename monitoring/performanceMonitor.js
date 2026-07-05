/**
 * ==========================================================
 * NAWI-EMPIRE001 PERFORMANCE MONITOR
 * FILE: monitoring/performanceMonitor.js
 * ==========================================================
 */

const os = require('os');

const collectPerformanceMetrics = () => {

    return {

        cpu: {
            cores: os.cpus().length,
            loadAverage: os.loadavg()
        },

        memory: {
            free: os.freemem(),
            total: os.totalmem(),
            usage: process.memoryUsage()
        },

        process: {
            pid: process.pid,
            uptime: process.uptime(),
            version: process.version
        },

        timestamp: new Date().toISOString()
    };
};

module.exports = {
    collectPerformanceMetrics
};