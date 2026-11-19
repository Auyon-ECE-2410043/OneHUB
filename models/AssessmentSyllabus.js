/**
 * File: AssessmentSyllabus.js
 * Description: Mongoose schema for storing Class Test (CT) and Lab Quiz syllabuses.
 * 
 * Part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const assessmentSyllabusSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, uppercase: true, default: "ECE" },
    semester: { type: String, required: true }, // e.g. "2-1", "2-2"
    series: { type: String, default: "" },       // e.g. "2024 Series"
    courseCode: { type: String, required: true, uppercase: true, trim: true }, // e.g. "ECE 2207"
    courseName: { type: String, default: "" },
    type: { type: String, enum: ["CT", "Quiz", "Assignment", "Lab Final"], default: "CT" },
    title: { type: String, default: "CT 1" },    // e.g. "CT 1", "CT 2", "Lab Quiz 1"
    syllabus: { type: String, required: true },  // e.g. "Chapter 1 & 2: Diode Circuits, BJT Biasing"
    assessmentDate: { type: String, default: "" }, // e.g. "Tuesday, 10:50 AM" or "2026-11-28"
    roomOrLab: { type: String, default: "" },    // e.g. "R-404"
    teacherInitials: { type: String, default: "" }, // e.g. "FT+NRP"
    targetGroup: { type: String, enum: ["All", "1st 30", "2nd 30"], default: "All" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    authorName: { type: String, default: "" },
  },
  { timestamps: true }
);

assessmentSyllabusSchema.index({ department: 1, semester: 1, courseCode: 1 });

module.exports = mongoose.model("AssessmentSyllabus", assessmentSyllabusSchema);
