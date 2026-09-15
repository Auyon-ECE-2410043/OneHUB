/**
 * File: medical.js
 * Description: Manages medical center appointments and health records.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const MedicalAppointment = require("../models/MedicalAppointment");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/medical/blood-directory -> Find emergency blood donors
router.get("/blood-directory", requireAuth, async (req, res) => {
  try {
    const { group } = req.query; // e.g. "O+"
    const filter = { role: { $in: ["student", "faculty", "admin"] } };
    if (group) {
      // Decode URL encoding if needed and handle '+', '-'
      const cleanGroup = decodeURIComponent(group).toUpperCase();
      filter.bloodGroup = cleanGroup;
    } else {
      filter.bloodGroup = { $ne: "", $exists: true };
    }

    const donors = await User.find(filter)
      .select("name rollNo department batch bloodGroup phone")
      .sort({ batch: -1, department: 1 });

    res.json({ count: donors.length, donors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/medical/appointments -> Book an appointment
router.post("/appointments", requireAuth, requireRole("student", "faculty", "admin"), async (req, res) => {
  try {
    const { doctorName, appointmentDate, timeSlot, symptoms } = req.body;
    
    // Check if student already has a pending appointment
    const existing = await MedicalAppointment.findOne({
      studentId: req.user.id,
      status: "scheduled"
    });

    if (existing) {
      return res.status(400).json({ error: "You already have a scheduled appointment. Please complete or cancel it first." });
    }

    const appointment = await MedicalAppointment.create({
      studentId: req.user.id,
      doctorName,
      appointmentDate,
      timeSlot,
      symptoms
    });

    res.status(201).json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medical/appointments -> View my appointments
router.get("/appointments", requireAuth, requireRole("student", "faculty", "admin"), async (req, res) => {
  try {
    const appointments = await MedicalAppointment.find({ studentId: req.user.id })
      .sort({ appointmentDate: -1, createdAt: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medical/doctor/queue -> Health staff/Doctor views queue for today
router.get("/doctor/queue", requireAuth, requireRole("health_staff", "admin"), async (req, res) => {
  try {
    // Return all scheduled appointments sorted by date and timeslot
    const queue = await MedicalAppointment.find({ status: "scheduled" })
      .populate("studentId", "name rollNo department batch gender bloodGroup phone")
      .sort({ appointmentDate: 1, timeSlot: 1 });
      
    res.json({ count: queue.length, queue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/medical/appointments/:id/complete -> Doctor completes appointment & attaches prescription
router.put("/appointments/:id/complete", requireAuth, requireRole("health_staff", "admin"), async (req, res) => {
  try {
    const { notes, prescriptionToken } = req.body;
    const appointment = await MedicalAppointment.findById(req.params.id);
    
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "completed";
    if (notes) appointment.notes = notes;
    if (prescriptionToken) appointment.prescriptionToken = prescriptionToken;
    
    await appointment.save();
    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
