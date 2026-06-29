const cron = require('node-cron');

const payoutService =
    require('../services/payoutService');

cron.schedule('0 */6 * * *', async () => {

    console.log(
        '💸 Running automated payout engine...'
    );

    try {

        await payoutService.processPendingPayouts();

    } catch (error) {

        console.error(
            'Payout Scheduler Error:',
            error.message
        );
    }

});

console.log(
    '🟢 Payout Scheduler Activated'
);