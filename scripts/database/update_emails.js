require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";
const CSV_FILE_PATH = "./2024_users_ECE.csv";

async function updateOfficialEmails() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const updates = [];

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on("data", (data) => {
        const keys = Object.keys(data);
        const email = data[keys[2]]?.trim(); // Email Address [Required]
        const password = data[keys[3]]?.trim(); // Password [Required]
        const recoveryEmail = data[keys[4]]?.trim(); // Recovery Email
        
        if (email && email.includes("@student.ruet.ac.bd")) {
          // Extract roll number from the email (e.g., 2410001 from 2410001@student.ruet.ac.bd)
          const rollNo = email.split("@")[0];
          
          updates.push({
            rollNo,
            officialEmail: email.toLowerCase(),
            recoveryEmail: recoveryEmail ? recoveryEmail.toLowerCase() : null,
            assignedPassword: password
          });
        }
      })
      .on("end", async () => {
        console.log(`Parsed ${updates.length} records from the new CSV.`);
        let updatedCount = 0;
        let notFoundCount = 0;

        for (const update of updates) {
          try {
            const user = await User.findOne({ rollNo: update.rollNo });
            if (user) {
              // We update their primary login email to the official varsity email
              user.email = update.officialEmail;
              
              // We can also hash and set their password to match the one provided by the varsity
              if (update.assignedPassword) {
                const salt = await bcrypt.genSalt(10);
                user.passwordHash = await bcrypt.hash(update.assignedPassword, salt);
              }
              
              await user.save();
              updatedCount++;
              console.log(`Updated ${user.name} (${user.rollNo}) with official email: ${user.email}`);
            } else {
              console.log(`Warning: Could not find user with roll ${update.rollNo} in the database.`);
              notFoundCount++;
            }
          } catch (err) {
            console.error(`Error updating roll ${update.rollNo}:`, err.message);
          }
        }

        console.log(`\nFinished updating! Successfully updated ${updatedCount} students.`);
        console.log(`Students can now log in using their @student.ruet.ac.bd emails and the university-assigned passwords (e.g., Ru@T...).`);
        process.exit(0);
      });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}

updateOfficialEmails();
