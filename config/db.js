const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        if (!process.env.MONGO_URI) {
            throw new Error(
                'MONGO_URI environment variable is missing'
            );
        }

        const conn = await mongoose.connect(
            process.env.MONGO_URI,
            {
                autoIndex: true
            }
        );

        console.log(`
=========================================
 NAWI-EMPIRE001 DATABASE CONNECTED
=========================================
 HOST: ${conn.connection.host}
 DATABASE: ${conn.connection.name}
 STATUS: ONLINE
=========================================
        `);

    } catch (error) {

        console.error(`
=========================================
 DATABASE CONNECTION FAILED
=========================================
 ${error.message}
=========================================
        `);

        process.exit(1);
    }
};

module.exports = connectDB;