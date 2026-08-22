/**
 * File: Course.js
 * Description: Mongoose schema for academic courses and syllabus.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, trim: true },
    courseName: { type: String, required: true },
    credit: { type: Number, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    courseType: { type: String, enum: ["theory", "sessional"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);