const mongoose = require('mongoose');
require("dotenv").config({ path: __dirname + "/../.env" });


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            /*
            db: {
                readPreference: "secondaryPreferred"
            }
            */
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

module.exports = connectDB;
