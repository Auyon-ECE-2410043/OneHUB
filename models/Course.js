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
    syllabus: [
      {
        topic: { type: String, required: true },
        details: { type: String, default: "" },
      }
    ],
    resources: [
      {
        title: { type: String, required: true },
        type: {
          type: String,
          enum: ["slides", "drive", "youtube", "book", "question", "note", "other"],
          default: "slides",
        },
        url: { type: String, required: true },
        description: { type: String, default: "" },
        uploadedBy: { type: String, default: "Faculty / CR" },
        uploaderRole: { type: String, default: "faculty" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    experiments: [
      {
        expNo: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, default: "" },
        sheetUrl: { type: String, default: "" },
        dateConducted: { type: String, default: "" },
        maxMarks: { type: Number, default: 20 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
