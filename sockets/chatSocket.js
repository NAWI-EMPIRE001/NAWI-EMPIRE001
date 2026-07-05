module.exports = (io) => {

    io.on('connection', (socket) => {

        socket.on('join-chat', roomId => {
            socket.join(roomId);
        });

        socket.on('send-message', data => {

            io.to(data.roomId)
                .emit('receive-message', data);
        });

    });

};