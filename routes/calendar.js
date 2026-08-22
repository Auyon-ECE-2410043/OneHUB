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
