const cron = require('node-cron');

const Escrow = require('../models/Escrow');

cron.schedule('*/30 * * * *', async () => {

    console.log(
        '🔍 Monitoring escrow transactions...'
    );

    try {

        const expiredEscrows =
            await Escrow.find({
                status: 'PENDING',
                expiresAt: {
                    $lt: new Date()
                }
            });

        for (const escrow of expiredEscrows) {

            escrow.status = 'CANCELLED';

            await escrow.save();
        }

    } catch (error) {

        console.error(
            'Escrow Monitor Error:',
            error.message
        );
    }

});

console.log(
    '🟢 Escrow Monitor Activated'
);