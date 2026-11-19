/**
 * File: HallMaintenance.js
 * Description: Mongoose schema representing student room maintenance requests and complaint tickets.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const hallMaintenanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hallName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    category: {
      type: String,
      enum: ["Electricity", "Plumbing", "Furniture", "Wi-Fi/LAN", "Cleanliness", "Other"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },
    technicianAssigned: { type: String, default: "" },
    staffNotes: { type: String, default: "" },
    reportedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HallMaintenance", hallMaintenanceSchema);
