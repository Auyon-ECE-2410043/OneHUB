/**
 * File: ClassSchedule.js
 * Description: Mongoose schema for weekly routine and class timings.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const classScheduleSchema = new mongoose.Schema(
  {
    department: { type: String, required: true, uppercase: true, default: "ECE" }, // e.g. "ECE"
    semester: { type: String, required: true }, // e.g. "2-1", "1-1", "2-2", "3-1", "4-1"
    series: { type: String, required: true },   // e.g. "2024 Series", "2025 Series"
    dayOfWeek: {
      type: String,
      enum: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      required: true,
    },
    startTime: { type: String, required: true }, // "08:00", "09:40", "10:50", "14:30" (24h format HH:mm)
    endTime: { type: String, required: true },   // "08:50", "10:30", "11:40", "17:00"
    courseCode: { type: String, required: true, uppercase: true, trim: true }, // e.g. "ECE 2103"
    courseName: { type: String, default: "" },
    type: { type: String, enum: ["theory", "sessional", "project"], default: "theory" },
    roomOrLab: { type: String, required: true }, // e.g. "R-403", "LAB-1", "LAB-14"
    teacherInitials: [{ type: String, uppercase: true, trim: true }], // e.g. ["MFA", "NIS"]
    teacherUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Linked teacher accounts
    targetGroup: { type: String, enum: ['All', '1st 30', '2nd 30'], default: 'All' }, // Group targeting for split labs
  },
  { timestamps: true }
);

classScheduleSchema.index({ department: 1, semester: 1, dayOfWeek: 1, startTime: 1 });

module.exports = mongoose.model("ClassSchedule", classScheduleSchema);
