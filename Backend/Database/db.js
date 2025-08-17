const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function ConnectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGOURI);
        console.log(`Mongo DB COnnected: ${conn.connection.host}`);
    } catch (error) {
        console.log("MongoDB Connection Failed: ", error.message);
        process.exit(1);
    }
}

module.exports = { ConnectDB };
