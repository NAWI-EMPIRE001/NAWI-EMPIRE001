module.exports = (io) => {

    io.on('connection', (socket) => {

        socket.on('join-notifications', userId => {

            socket.join(`notifications-${userId}`);
        });

    });

};

module.exports.sendNotification = (
    io,
    userId,
    payload
) => {

    io.to(`notifications-${userId}`)
        .emit('new-notification', payload);
};