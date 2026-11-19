/**
 * File: LabProgress.js
 * Description: Mongoose database schema definition for Student Lab Experiments and Submissions.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const labProgressSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    expNo: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "submitted", "evaluated"],
      default: "pending",
    },
    reportUrl: { type: String, default: "" },
    marksObtained: { type: Number, default: null },
    maxMarks: { type: Number, default: 20 },
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: null },
    evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    evaluatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

labProgressSchema.index({ studentId: 1, courseId: 1, expNo: 1 }, { unique: true });

module.exports = mongoose.model("LabProgress", labProgressSchema);
