const mongoose = require("mongoose");

function connectToDB() {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("Connected to MongoDB successfully");
        }).catch((error) => {
            console.log("Error in Db", error);
        })
}

module.exports = connectToDB