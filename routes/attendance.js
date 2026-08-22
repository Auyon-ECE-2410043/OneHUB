/**
 * File: attendance.js
 * Description: Allows faculty to take attendance and students to view their attendance records.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Attendance = require("../models/Attendance");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getAttendanceEvaluation } = require("../utils/ruetOrdinance");

const router = express.Router();

// POST /api/attendance -> Mark single attendance
router.post("/", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { studentId, courseId, semester, date, present } = req.body;

    const record = await Attendance.findOneAndUpdate(
      { studentId, courseId, date: new Date(date) },
      { studentId, courseId, semester, date: new Date(date), present: !!present, markedBy: req.user.id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/attendance/bulk -> Mark class attendance for a date
router.post("/bulk", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { courseId, semester, date, entries } = req.body;

    const results = await Promise.all(
      entries.map((entry) =>
        Attendance.findOneAndUpdate(
          { studentId: entry.studentId, courseId, date: new Date(date) },
          { studentId: entry.studentId, courseId, semester, date: new Date(date), present: !!entry.present, markedBy: req.user.id },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
      )
    );

    res.status(201).json({ count: results.length, records: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/attendance/:courseId -> Student day-by-day attendance + RUET ordinance status
router.get("/:courseId", requireAuth, async (req, res) => {
  try {
    const records = await Attendance.find({
      studentId: req.user.id,
      courseId: req.params.courseId,
    }).sort({ date: 1 });

    const totalClasses = records.length;
    const presentCount = records.filter((r) => r.present).length;
    const percentage = totalClasses > 0 ? parseFloat(((presentCount / totalClasses) * 100).toFixed(1)) : 0;

    const evaluation = getAttendanceEvaluation(percentage);

    res.json({
      records,
      totalClasses,
      presentCount,
      percentage,
      attendanceMarks: evaluation.attendanceMarks,
      status: evaluation.status,
      isEligibleForExam: evaluation.isEligibleForExam,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;