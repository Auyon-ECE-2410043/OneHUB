/**
 * File: MedicalAppointment.js
 * Description: Mongoose database schema definition for MedicalAppointment.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const medicalAppointmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorName: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 10:30 AM"
    symptoms: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    prescriptionToken: { type: String, default: null }, // Link to external digital prescription
    notes: { type: String, default: "" }, // Doctor's private notes
  },
  { timestamps: true }
);

module.exports = mongoose.model("MedicalAppointment", medicalAppointmentSchema);
