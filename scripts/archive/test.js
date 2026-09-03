
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await mongoose.connection.collection("users").findOne({ email: "2410043@student.ruet.ac.bd" });
    console.log(user);
    process.exit(0);
});

