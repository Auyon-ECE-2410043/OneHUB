require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/onehub";
const CSV_FILE_PATH = "./B24.UGRM_Student Info.csv";

const DEFAULT_PASSWORD = "ruet"; // Base password, will append Roll Number for security

async function seedStudents() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const students = [];
    let rowCount = 0;

    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv({ skipLines: 2 })) // Skip the first 2 header rows
      .on("data", (data) => {
        // Map the CSV keys manually since the header is on line 3
        const keys = Object.keys(data);
        const roll = data[keys[0]]?.trim();
        const name = data[keys[1]]?.trim();
        const nameBengali = data[keys[2]]?.trim();
        const gender = data[keys[5]]?.trim();
        const bloodGroup = data[keys[7]]?.trim();
        const email = data[keys[14]]?.trim();
        const phone = data[keys[15]]?.trim();
        const rollNumber = data[keys[19]]?.trim();
        const registrationNo = data[keys[20]]?.trim();

        if (rollNumber && email && name && rollNumber.startsWith("24")) {
          students.push({
            name,
            nameBengali,
            gender: gender === "Male" || gender === "Female" ? gender : "Other",
            bloodGroup,
            email: email.toLowerCase(),
            phone,
            rollNo: rollNumber,
            registrationNo,
            department: "ECE",
            batch: "24",
            role: "student",
          });
        }
      })
      .on("end", async () => {
        console.log(`Found ${students.length} valid students in the CSV.`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const student of students) {
          try {
            // Delete if exists by email, rollNo, or registrationNo to overwrite with CSV info
            const deleted = await User.deleteMany({
              $or: [
                { email: student.email },
                { rollNo: student.rollNo },
                { registrationNo: student.registrationNo }
              ]
            });
            if (deleted.deletedCount > 0) {
              console.log(`Deleted existing user(s) matching ${student.name} (${student.rollNo}) for clean overwrite.`);
            }

            const salt = await bcrypt.genSalt(10);
            // Temporary password is "ruet" + RollNumber, e.g. "ruet2410001"
            student.passwordHash = await bcrypt.hash(`ruet${student.rollNo}`, salt);

            const newUser = new User(student);
            await newUser.save();
            createdCount++;
            console.log(`Created/Overwrote: ${student.name} (${student.rollNo})`);
          } catch (err) {
            console.error(`Error creating ${student.name}:`, err.message);
          }
        }

        console.log(`\nDone! Created ${createdCount} accounts. Skipped ${skippedCount}.`);
        console.log("Students can log in with their email and password: ruet[RollNumber] (e.g. ruet2410001)");
        process.exit(0);
      });
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
}

seedStudents();
