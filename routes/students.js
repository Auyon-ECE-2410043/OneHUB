/**
 * File: students.js
 * Description: Admin endpoints to manage student records and import student data.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/students?search=... -> faculty/admin searches students by name or roll
router.get("/", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const filter = { role: "student" };
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      filter.$or = [{ name: regex }, { rollNo: regex }];
    }
    const students = await User.find(filter).select("name rollNo department batch").sort({ rollNo: 1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;