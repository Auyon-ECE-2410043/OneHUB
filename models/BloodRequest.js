/**
 * File: BloodRequest.js
 * Description: Schema for Emergency Blood Donor Requests and Broadcast Alerts.
 * 
 * Part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    unitsNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    hospital: {
      type: String,
      required: true,
      trim: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ["Immediate (Next 1-2 Hours)", "Today", "Urgent"],
      default: "Immediate (Next 1-2 Hours)",
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "fulfilled", "cancelled"],
      default: "active",
    },
    notifiedCount: {
      type: Number,
      default: 0,
    },
    fulfilledAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

bloodRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
