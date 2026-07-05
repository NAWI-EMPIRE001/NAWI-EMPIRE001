/**
 * ==========================================================
 * NAWI-EMPIRE001 SOCKET CONFIGURATION
 * FILE: config/socket.js
 * ==========================================================
 */

const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {

    io = new Server(server, {

        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        },

        transports: [
            'websocket',
            'polling'
        ]
    });

    io.on('connection', (socket) => {

        console.log(
            `🟢 Socket Connected: ${socket.id}`
        );

        socket.on('join-room', roomId => {
            socket.join(roomId);
        });

        socket.on('disconnect', () => {

            console.log(
                `🔴 Socket Disconnected: ${socket.id}`
            );
        });
    });

    return io;
};

const getIO = () => {

    if (!io) {
        throw new Error(
            'Socket.IO not initialized.'
        );
    }

    return io;
};

module.exports = {
    initializeSocket,
    getIO
};