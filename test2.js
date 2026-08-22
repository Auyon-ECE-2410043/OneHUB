
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
    const fs = require("fs");
    const faculties = await mongoose.connection.collection("users").find({ role: "faculty" }).toArray();
    const mkg = await mongoose.connection.collection("users").findOne({ name: /moloy kumar/i });
    fs.writeFileSync("output.json", JSON.stringify({ count: faculties.length, first: faculties[0], mkg }, null, 2));
    process.exit(0);
});

