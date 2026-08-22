/**
 * File: Clearance.js
 * Description: Mongoose database schema definition for Clearance.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const clearanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: String, required: true }, // e.g., "2-1"
    status: {
      type: String,
      enum: ["pending", "cleared", "rejected"],
      default: "pending",
    },
    departments: {
      accounts: {
        status: { type: String, enum: ["pending", "cleared", "rejected"], default: "pending" },
        clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String, default: "" },
      },
      hall: {
        status: { type: String, enum: ["pending", "cleared", "rejected", "not_applicable"], default: "pending" },
        clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String, default: "" },
      },
      library: {
        status: { type: String, enum: ["pending", "cleared", "rejected"], default: "pending" },
        clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String, default: "" },
      },
      departmental: {
        status: { type: String, enum: ["pending", "cleared", "rejected"], default: "pending" },
        clearedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        remarks: { type: String, default: "" },
      }
    },
    admitCardGenerated: { type: Boolean, default: false },
    admitCardToken: { type: String, default: null }, // Unique QR token
  },
  { timestamps: true }
);

clearanceSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("Clearance", clearanceSchema);
