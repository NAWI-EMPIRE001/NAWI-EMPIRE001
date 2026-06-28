// ==========================================================
// 👑 NAWI-EMPIRE001 REAL-TIME SOCKET ENGINE
// FILE: sockets/index.js
// PURPOSE:
// - Global real-time communication layer
// - Messaging
// - Live streams
// - Wallet synchronization
// - Escrow notifications
// - Arena battles
// ==========================================================

const { Server } = require('socket.io');

let io;

// ==========================================================
// INITIALIZE SOCKET SERVER
// ==========================================================
const initSockets = (server) => {

    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },

        pingTimeout: 60000,
        pingInterval: 25000,

        transports: [
            'websocket',
            'polling'
        ]
    });

    console.log('🟣 NAWI-EMPIRE001 Socket Engine Activated');

    // ======================================================
    // CONNECTION HANDLER
    // ======================================================
    io.on('connection', (socket) => {

        console.log(`🟢 User Connected: ${socket.id}`);

        // ==================================================
        // USER REGISTRATION
        // ==================================================
        socket.on('register-user', (userId) => {

            if (!userId) return;

            socket.join(`user_${userId}`);

            console.log(
                `👤 User ${userId} registered on socket ${socket.id}`
            );
        });

        // ==================================================
        // LIVE STREAM ROOMS
        // ==================================================
        socket.on('join-stream', (streamId) => {

            if (!streamId) return;

            socket.join(`stream_${streamId}`);

            console.log(
                `📺 ${socket.id} joined stream ${streamId}`
            );
        });

        socket.on('leave-stream', (streamId) => {

            socket.leave(`stream_${streamId}`);

            console.log(
                `🚪 ${socket.id} left stream ${streamId}`
            );
        });

        // ==================================================
        // ARENA BATTLE ROOMS
        // ==================================================
        socket.on('join-battle', (battleId) => {

            if (!battleId) return;

            socket.join(`battle_${battleId}`);

            console.log(
                `⚔️ ${socket.id} joined battle ${battleId}`
            );
        });

        // ==================================================
        // PRIVATE CHAT
        // ==================================================
        socket.on('private-message', (payload) => {

            if (!payload?.receiverId) return;

            io.to(`user_${payload.receiverId}`)
                .emit('new-message', payload);
        });

        // ==================================================
        // TYPING INDICATOR
        // ==================================================
        socket.on('typing', ({ receiverId, senderId }) => {

            io.to(`user_${receiverId}`)
                .emit('user-typing', {
                    senderId
                });
        });

        // ==================================================
        // LIVE GIFTS
        // ==================================================
        socket.on('send-gift', (giftData) => {

            if (!giftData?.streamId) return;

            io.to(`stream_${giftData.streamId}`)
                .emit('gift-received', giftData);
        });

        // ==================================================
        // DISCONNECT
        // ==================================================
        socket.on('disconnect', (reason) => {

            console.log(
                `🔴 User Disconnected: ${socket.id}`
            );

            console.log(`Reason: ${reason}`);
        });

        // ==================================================
        // SOCKET ERROR
        // ==================================================
        socket.on('error', (err) => {

            console.error(
                `❌ Socket Error (${socket.id}):`,
                err.message
            );
        });
    });

    return io;
};

// ==========================================================
// SOCKET GETTER
// Allows services/controllers to emit globally
// ==========================================================
const getIO = () => {

    if (!io) {
        throw new Error(
            'Socket.io has not been initialized.'
        );
    }

    return io;
};

// ==========================================================
// GLOBAL EMITTER HELPERS
// ==========================================================
const emitToUser = (userId, event, payload) => {

    if (!io) return;

    io.to(`user_${userId}`)
        .emit(event, payload);
};

const emitToStream = (streamId, event, payload) => {

    if (!io) return;

    io.to(`stream_${streamId}`)
        .emit(event, payload);
};

const emitToBattle = (battleId, event, payload) => {

    if (!io) return;

    io.to(`battle_${battleId}`)
        .emit(event, payload);
};

const broadcast = (event, payload) => {

    if (!io) return;

    io.emit(event, payload);
};

// ==========================================================
// EXPORTS
// ==========================================================
models.exports = initSockets;

models.exports.getIO = getIO;
models.exports.emitToUser = emitToUser;
models.exports.emitToStream = emitToStream;
models.exports.emitToBattle = emitToBattle;
models.exports.broadcast = broadcast;
