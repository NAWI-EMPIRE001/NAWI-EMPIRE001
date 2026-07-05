const Analytics =
    require('../models/Analytics');

exports.logEvent = async ({
    user,
    eventType,
    pillar = 'GENERAL',
    metadata = {},
    ipAddress = '',
    device = ''
}) => {

    try {

        await Analytics.create({
            user,
            eventType,
            pillar,
            metadata,
            ipAddress,
            device
        });

    } catch (error) {

        console.error(
            'Analytics Error:',
            error.message
        );
    }
};