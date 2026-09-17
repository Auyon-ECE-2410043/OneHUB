/**
 * File: Mark.js
 * Description: Mongoose database schema definition for Mark.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const markSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: String, required: true },
    type: { type: String, enum: ["ct", "quiz", "assignment", "final"], required: true },
    instanceNumber: { type: Number, default: 1 }, // CT: 1-4, Quiz: 1,2,3..., ignored for assignment/final
    marksObtained: { type: Number, default: null }, // used for ct/quiz/assignment
    totalMarks: { type: Number, default: null }, // 20 for ct/quiz, 10 for assignment
    grade: { type: String, default: null }, // used for final, e.g. "A+"
    gpaPoint: { type: Number, default: null }, // auto-calculated from grade
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mappedCOs: [{ type: String }], // Array of CO codes (e.g. ["CO1", "CO2"])
  },
  { timestamps: true }
);

markSchema.index({ studentId: 1, courseId: 1, semester: 1, type: 1, instanceNumber: 1 }, { unique: true });

module.exports = mongoose.model("Mark", markSchema);