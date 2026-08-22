/**
 * File: clearance.js
 * Description: Handles graduation clearance workflows for students.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const crypto = require("crypto");
const Clearance = require("../models/Clearance");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/clearance -> Student gets their clearance status
router.get("/", requireAuth, async (req, res) => {
  try {
    const { semester } = req.query;
    if (!semester) return res.status(400).json({ error: "Semester is required" });

    let clearance = await Clearance.findOne({ studentId: req.user.id, semester });
    
    if (!clearance) {
      // Auto-initialize clearance file if it doesn't exist
      const student = await User.findById(req.user.id);
      clearance = await Clearance.create({
        studentId: student._id,
        semester,
        // If not assigned a hall, hall clearance is NA
        "departments.hall.status": "not_applicable" // simplified logic
      });
    }

    res.json({ clearance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clearance/pending/:dept -> Admin/Staff gets pending clearances
router.get("/pending/:dept", requireAuth, requireRole("admin", "faculty", "hall_admin"), async (req, res) => {
  try {
    const { dept } = req.params;
    const validDepts = ["accounts", "hall", "library", "departmental"];
    if (!validDepts.includes(dept)) return res.status(400).json({ error: "Invalid department" });

    const filter = {};
    filter[`departments.${dept}.status`] = "pending";

    const clearances = await Clearance.find(filter)
      .populate("studentId", "name rollNo department batch")
      .sort({ createdAt: 1 });

    res.json({ clearances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clearance/:id/:dept/approve -> Admin/Staff approves a specific department
router.put("/:id/:dept/approve", requireAuth, requireRole("admin", "faculty", "hall_admin"), async (req, res) => {
  try {
    const { dept } = req.params;
    const { remarks } = req.body;
    const validDepts = ["accounts", "hall", "library", "departmental"];
    if (!validDepts.includes(dept)) return res.status(400).json({ error: "Invalid department" });

    const clearance = await Clearance.findById(req.params.id);
    if (!clearance) return res.status(404).json({ error: "Clearance not found" });

    clearance.departments[dept].status = "cleared";
    clearance.departments[dept].clearedBy = req.user.id;
    if (remarks) clearance.departments[dept].remarks = remarks;

    // Check if fully cleared
    const depts = clearance.departments;
    const allCleared = 
      (depts.accounts.status === "cleared") &&
      (depts.library.status === "cleared") &&
      (depts.departmental.status === "cleared") &&
      (depts.hall.status === "cleared" || depts.hall.status === "not_applicable");

    if (allCleared) {
      clearance.status = "cleared";
    }

    await clearance.save();
    res.json({ clearance, allCleared });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clearance/:id/generate-admit -> Generate Digital Admit Card if fully cleared
router.post("/:id/generate-admit", requireAuth, async (req, res) => {
  try {
    const clearance = await Clearance.findById(req.params.id);
    if (!clearance) return res.status(404).json({ error: "Clearance not found" });

    if (clearance.studentId.toString() !== req.user.id && req.user.role === "student") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (clearance.status !== "cleared") {
      return res.status(400).json({ error: "Cannot generate admit card. Clearance is incomplete." });
    }

    if (!clearance.admitCardGenerated) {
      // Generate a secure unique 16 character hex token
      clearance.admitCardToken = "RUET-ADMIT-" + crypto.randomBytes(8).toString("hex").toUpperCase();
      clearance.admitCardGenerated = true;
      await clearance.save();
    }

    res.json({
      message: "Admit Card Generated Successfully",
      token: clearance.admitCardToken,
      qrData: `Verify at onehub.ruet.ac.bd/verify/${clearance.admitCardToken}`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
