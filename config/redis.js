/**
 * ==========================================================
 * NAWI-EMPIRE001 REDIS CONFIGURATION
 * FILE: config/redis.js
 * PURPOSE:
 * - Cache Layer
 * - Session Store
 * - Queue Engine
 * ==========================================================
 */

const Redis = require('ioredis');

let redisClient = null;

const connectRedis = () => {

    if (redisClient)
        return redisClient;

    redisClient = new Redis(
        process.env.REDIS_URL || {
            host: '127.0.0.1',
            port: 6379
        }
    );

    redisClient.on('connect', () => {
        console.log('🟢 Redis Connected');
    });

    redisClient.on('error', err => {
        console.error(
            '🔴 Redis Error:',
            err.message
        );
    });

    return redisClient;
};

module.exports = connectRedis;