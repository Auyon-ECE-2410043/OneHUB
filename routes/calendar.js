/**
 * File: calendar.js
 * Description: Provides the academic calendar and holiday schedule.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Holiday = require("../models/Holiday");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/calendar/holidays -> Get all holidays for the year
router.get("/holidays", async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ startDate: 1 });
    res.json({ holidays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/calendar/holidays -> Add new holiday (Admin only)
router.post("/holidays", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const holiday = new Holiday(req.body);
    await holiday.save();
    res.status(201).json({ message: "Holiday added successfully", holiday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/calendar/holidays/:id -> Update holiday (Admin only)
router.put("/holidays/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!holiday) return res.status(404).json({ error: "Holiday not found" });
    res.json({ message: "Holiday updated successfully", holiday });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/calendar/holidays/:id -> Delete holiday (Admin only)
router.delete("/holidays/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ error: "Holiday not found" });
    res.json({ message: "Holiday deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
