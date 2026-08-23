/**
 * File: routine.js
 * Description: Manages the weekly class routine and schedules for students and faculty.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const ClassSchedule = require("../models/ClassSchedule");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// GET /api/routine -> Full semester routine filterable by department, semester, day
router.get("/", requireAuth, async (req, res) => {
  try {
    const { department, semester, dayOfWeek } = req.query;
    const filter = {};
    if (department) filter.department = department.toUpperCase();
    if (semester) filter.semester = semester;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    const routine = await ClassSchedule.find(filter).sort({ startTime: 1 });
    res.json({ count: routine.length, routine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routine/my-week -> Personalized schedule for the whole week
router.get("/my-week", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let filter = {};

    if (user.role === "student") {
      filter.department = user.department;
      if (user.batch) {
        // Find if batch matches series (e.g. '24' matches '2024 Series' or '24 Series')
        // Actually, we can fetch all and filter in JS if complex, but simple regex is fine:
        filter.series = { $regex: new RegExp(user.batch.slice(-2), "i") }; // grabs '24' from '2024' or '2024-2025'
      }
    } else if (user.role === "faculty") {
      filter.department = user.department;
      if (user.teacherAcronym) {
        filter.teacherInitials = user.teacherAcronym;
      }
    }

    const myWeekClasses = await ClassSchedule.find(filter).sort({ dayOfWeek: 1, startTime: 1 });
    res.json({ routine: myWeekClasses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routine/today -> Today's personalized schedule for logged-in Student or Teacher
router.get("/today", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Current Day in Bangladesh
    const bdTime = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const today = DAYS[bdTime.getDay()];

    let filter = { dayOfWeek: today };

    if (user.role === "student") {
      filter.department = user.department;
      if (user.batch) {
        filter.series = { $regex: new RegExp(user.batch, "i") };
      }
    } else if (user.role === "faculty") {
      filter.department = user.department;
      if (user.teacherAcronym) {
        filter.teacherInitials = user.teacherAcronym;
      }
    }

    const todayClasses = await ClassSchedule.find(filter).sort({ startTime: 1 });

    // Determine current & next upcoming class
    const currentHours = String(bdTime.getHours()).padStart(2, "0");
    const currentMinutes = String(bdTime.getMinutes()).padStart(2, "0");
    const currentTime24 = `${currentHours}:${currentMinutes}`;

    const nextClass = todayClasses.find((c) => c.startTime > currentTime24);

    res.json({
      day: today,
      currentTime: currentTime24,
      totalClassesToday: todayClasses.length,
      classes: todayClasses,
      nextUpcomingClass: nextClass || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/routine/weekly -> Full weekly schedule for logged-in Student or Teacher
router.get("/weekly", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let filter = {};

    if (user.role === "student") {
      filter.department = user.department;
      if (user.batch) {
        filter.series = { $regex: new RegExp(user.batch, "i") };
      }
    } else if (user.role === "faculty") {
      filter.department = user.department;
      if (user.teacherAcronym) {
        filter.teacherInitials = user.teacherAcronym;
      }
    }

    const weeklyClasses = await ClassSchedule.find(filter).sort({ startTime: 1 });
    res.json({ classes: weeklyClasses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/routine/slot -> Admin adds or updates a routine slot
router.post("/slot", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { department, semester, series, dayOfWeek, startTime, endTime, courseCode, courseName, roomOrLab, teacherInitials, type } = req.body;

    const slot = await ClassSchedule.create({
      department,
      semester,
      series,
      dayOfWeek,
      startTime,
      endTime,
      courseCode,
      courseName: courseName || "",
      roomOrLab,
      teacherInitials: teacherInitials || [],
      type: type || "theory",
    });

    res.status(201).json({ slot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/routine -> Add new routine slot (Admin only)
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const newSlot = new ClassSchedule(req.body);
    await newSlot.save();
    res.status(201).json({ message: 'Routine slot added', slot: newSlot });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/routine/:id -> Update routine slot (Admin only)
router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const updatedSlot = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSlot) return res.status(404).json({ error: 'Slot not found' });
    res.json({ message: 'Routine slot updated', slot: updatedSlot });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/routine/:id -> Delete routine slot (Admin only)
router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const deletedSlot = await ClassSchedule.findByIdAndDelete(req.params.id);
    if (!deletedSlot) return res.status(404).json({ error: 'Slot not found' });
    res.json({ message: 'Routine slot deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
