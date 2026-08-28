/**
 * File: User.js
 * Description: Mongoose schema for system users (Students, Faculty, Admins).
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameBengali: { type: String, default: "" },
    rollNo: { type: String, unique: true, sparse: true },
    registrationNo: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isFirstLogin: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "hall_admin", "health_staff"],
      default: "student",
    },
    department: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other", null], default: null },
    batch: { type: String },
    phone: { type: String, default: "" },
    fatherContactNo: { type: String, default: "" },
    motherContactNo: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    previouslyEarnedCredit: { type: Number, default: 0 },
    adviserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Faculty specific fields
    teacherAcronym: { type: String, uppercase: true, trim: true, sparse: true },
    seniorityOrder: { type: Number, default: 999 },
    designation: {
      type: String,
      enum: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Retired Faculty", null],
      default: null,
    },
    isPhdHolder: { type: Boolean, default: false },
    isHeadOfDept: { type: Boolean, default: false },
    isOnLeave: { type: Boolean, default: false },
    officeLocation: { type: String, default: "" },
    photoUrl: { type: String, default: null },
    
    // Extended Faculty Profile Fields
    website: { type: String, default: "" },
    firstJoined: { type: String, default: "" },
    fieldOfResearch: [{ type: String }],
    education: [
      {
        degree: { type: String },
        institution: { type: String },
        year: { type: String }
      }
    ],
    positionHistory: [
      {
        role: { type: String },
        duration: { type: String },
        institution: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);