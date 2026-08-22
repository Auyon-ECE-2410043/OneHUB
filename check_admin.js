
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const admin = await mongoose.connection.collection("users").findOne({ role: "admin" });
    console.log("Admin:", admin);
    process.exit(0);
});

