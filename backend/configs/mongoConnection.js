const mongoose = require("mongoose");

const connectToMongoDB = async () => {
    console.log(`Trying connecting to mongodb ...`.cyan.underline);
    try {
        const conn = await mongoose.connect(process.env.DB_MONGOS_URL);
        console.log(
            `MongoDB Connected: ${conn.connection.host}`.cyan.underline
        );
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectToMongoDB;
