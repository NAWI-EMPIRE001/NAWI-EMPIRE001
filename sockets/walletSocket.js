module.exports = (io) => {

    io.on('connection', (socket) => {

        socket.on('join-wallet', (userId) => {

            socket.join(`wallet-${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('Wallet socket disconnected');
        });

    });

};