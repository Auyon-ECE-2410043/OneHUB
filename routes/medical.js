/**
 * File: medical.js
 * Description: Manages medical center appointments and health records.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const MedicalAppointment = require("../models/MedicalAppointment");
const BloodRequest = require("../models/BloodRequest");
const Notification = require("../models/Notification");
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

// POST /api/medical/emergency-blood-request -> Broadcast urgent blood request to all matching donors
router.post("/emergency-blood-request", requireAuth, async (req, res) => {
  try {
    const { patientName, bloodGroup, unitsNeeded, hospital, contactNumber, urgency, reason } = req.body;
    if (!patientName || !bloodGroup || !hospital || !contactNumber) {
      return res.status(400).json({ error: "Patient name, blood group, hospital, and contact number are required." });
    }

    const cleanGroup = bloodGroup.trim().toUpperCase();

    // Find all registered students/faculty matching this blood group
    const matchingDonors = await User.find({
      bloodGroup: cleanGroup,
      _id: { $ne: req.user.id }
    }).select("_id name rollNo phone role");

    const bloodRequest = await BloodRequest.create({
      requesterId: req.user.id,
      patientName,
      bloodGroup: cleanGroup,
      unitsNeeded: Number(unitsNeeded) || 1,
      hospital,
      contactNumber,
      urgency: urgency || "Immediate (Next 1-2 Hours)",
      reason: reason || "",
      status: "active",
      notifiedCount: matchingDonors.length
    });

    // Create notifications for matching donors
    if (matchingDonors.length > 0) {
      const notifications = matchingDonors.map((donor) => ({
        recipientId: donor._id,
        recipientRole: donor.role || "student",
        title: `🩸 URGENT: ${cleanGroup} Blood Needed!`,
        message: `Emergency at ${hospital}: ${unitsNeeded || 1} unit(s) of ${cleanGroup} needed for ${patientName}. Urgency: ${urgency || "Immediate"}. Contact: ${contactNumber}`,
        type: "urgent_blood",
        link: "/medical",
        meta: {
          bloodGroup: cleanGroup,
          hospital,
          contactNumber,
          requestId: bloodRequest._id.toString()
        }
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      request: bloodRequest,
      notifiedCount: matchingDonors.length
    });
  } catch (err) {
    console.error("Emergency blood request error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/medical/emergency-blood-requests -> List active & recent emergency blood requests
router.get("/emergency-blood-requests", requireAuth, async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate("requesterId", "name rollNo department phone")
      .sort({ status: 1, createdAt: -1 })
      .limit(25);
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/medical/emergency-blood-requests/:id/fulfill -> Mark request as fulfilled
router.put("/emergency-blood-requests/:id/fulfill", requireAuth, async (req, res) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) return res.status(404).json({ error: "Blood request not found" });

    bloodRequest.status = "fulfilled";
    bloodRequest.fulfilledAt = new Date();
    await bloodRequest.save();

    res.json({ success: true, request: bloodRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
