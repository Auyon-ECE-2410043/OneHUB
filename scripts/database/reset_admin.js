
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("admin123", salt);
    
    await User.updateOne({ role: "admin" }, { $set: { passwordHash: hash } });
    console.log("Admin password reset to: admin123");
    
    process.exit(0);
});

