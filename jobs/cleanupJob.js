const cron = require('node-cron');

const Notification =
    require('../models/Notification');

cron.schedule('0 0 * * *', async () => {

    console.log(
        '🧹 Running cleanup engine...'
    );

    try {

        const thirtyDaysAgo = new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
        );

        await Notification.deleteMany({
            createdAt: {
                $lt: thirtyDaysAgo
            }
        });

    } catch (error) {

        console.error(
            'Cleanup Job Error:',
            error.message
        );
    }

});

console.log(
    '🟢 Cleanup Scheduler Activated'
);