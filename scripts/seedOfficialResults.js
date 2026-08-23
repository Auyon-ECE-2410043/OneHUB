/**
 * Script to seed Official Results into the database.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const OfficialResult = require("../models/OfficialResult");
const fs = require("fs");
const path = require("path");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const dataPath = path.join(__dirname, "../temp/extracted_results_1_1.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    let inserted = 0;
    let skipped = 0;

    for (const record of data) {
      // Find user by rollNo
      const user = await User.findOne({ rollNo: record.rollNo });
      if (!user) {
        console.warn(`User with rollNo ${record.rollNo} not found. Skipping.`);
        skipped++;
        continue;
      }

      // Upsert OfficialResult
      await OfficialResult.findOneAndUpdate(
        { studentId: user._id, semester: "1-1" },
        {
          sgp: record.sgp,
          semesterEarnedCredit: record.semesterEarnedCredit,
          totalEarnedCredit: record.totalEarnedCredit,
          sgpa: record.sgpa,
          cgpa: record.cgpa,
          failedSubjects: record.failedSubjects,
          needToRegisterAgain: record.needToRegisterAgain,
          publishedAt: new Date("2026-05-05")
        },
        { upsert: true, new: true }
      );
      inserted++;
    }

    console.log(`Finished seeding results. Inserted/Updated: ${inserted}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
}

seed();
