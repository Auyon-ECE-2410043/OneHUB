/**
 * File: CourseAssignment.js
 * Description: Mongoose database schema definition for CourseAssignment.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const courseAssignmentSchema = new mongoose.Schema(
  {
    batch: { type: String, required: true },
    department: { type: String, required: true },
    semester: { type: String, required: true },
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

courseAssignmentSchema.index({ batch: 1, department: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("CourseAssignment", courseAssignmentSchema);