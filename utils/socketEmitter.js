// ======================================================
// NAWI-EMPIRE001
// FILE: utils/socketEmitter.js
// PURPOSE: Global Socket Broadcast Layer
// ======================================================

let io = null;

// Register Socket.IO instance
const initializeSocketEmitter = (socketServer) => {
    io = socketServer;

    console.log(
        '🟣 Global Socket Emitter Initialized'
    );
};

// Emit globally
const emitGlobal = (event, payload) => {
    if (!io) {
        console.warn(
            `⚠️ Socket unavailable. Event skipped: ${event}`
        );
        return;
    }

    io.emit(event, payload);
};

// Emit to a room
const emitToRoom = (roomId, event, payload) => {
    if (!io) return;

    io.to(roomId).emit(event, payload);
};

// Emit to a specific user
const emitToUser = (userId, event, payload) => {
    if (!io) return;

    io.to(`user_${userId}`).emit(event, payload);
};

// Get io instance if needed elsewhere
const getIO = () => io;

module.exports = {
    initializeSocketEmitter,
    emitGlobal,
    emitToRoom,
    emitToUser,
    getIO
};
