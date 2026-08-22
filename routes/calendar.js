/**
 * File: calendar.js
 * Description: Provides the academic calendar and holiday schedule.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Holiday = require("../models/Holiday");

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

module.exports = router;
