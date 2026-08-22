/**
 * File: Registration.js
 * Description: Mongoose database schema definition for Registration.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: String, required: true },
    academicSession: { type: String },
    previouslyEarnedCredit: { type: Number, default: 0 },
    backlogCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    totalCredit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending_approval", "approved", "rejected"],
      default: "pending_approval",
    },
    adviserComment: { type: String, default: "" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    registrationFeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", default: null },
    examFeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", default: null },
    hallFeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", default: null },
    extraFeeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Fee" }],
  },
  { timestamps: true }
);

registrationSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);