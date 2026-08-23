/**
 * File: OfficialResult.js
 * Description: Mongoose database schema definition for Official Result.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const officialResultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: String, required: true }, // e.g., "1-2"
    sgp: { type: Number },
    semesterEarnedCredit: { type: Number },
    totalEarnedCredit: { type: Number },
    sgpa: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    failedSubjects: { type: String, default: "" },
    needToRegisterAgain: { type: String, default: "" },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

officialResultSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("OfficialResult", officialResultSchema);
