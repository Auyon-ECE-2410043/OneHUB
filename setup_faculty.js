
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("ruetfaculty", salt);
    
    // Update all faculty members to have the password "ruetfaculty"
    await User.updateMany({ role: "faculty" }, { $set: { passwordHash: hash } });
    
    // Check if adviser account exists, if not create it
    const advEmail = "adviser.ece24@ruet.ac.bd";
    let adviser = await User.findOne({ email: advEmail });
    if (!adviser) {
        adviser = new User({
            name: "Moloy Kumar Ghosh (Course Adviser)",
            email: advEmail,
            passwordHash: hash,
            role: "faculty", // Using faculty role because adviser is just a specialized faculty
            department: "ECE"
        });
        await adviser.save();
    }
    console.log("Updated all faculty passwords to: ruetfaculty");
    console.log("Created Course Adviser account for Moloy Kumar Ghosh:");
    console.log("Email:", advEmail);
    console.log("Password: ruetfaculty");
    
    process.exit(0);
});

