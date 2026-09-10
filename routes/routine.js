/**
 * File: routine.js
 * Description: Manages the weekly class routine and schedules for students and faculty.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const ClassSchedule = require("../models/ClassSchedule");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper to determine student's target group (1st 30 / 2nd 30) based on roll number
const getStudentGroup = (rollNo) => {
  if (!rollNo || rollNo.length < 3) return "All";
  const rollEnd = parseInt(rollNo.slice(-3), 10);
  return rollEnd <= 30 ? "1st 30" : "2nd 30";
};

// Helper to send notifications when a group-specific slot is created/updated
const notifyGroup = async (slot) => {
  try {
    // Only notify if targetGroup is specific
    if (!["1st 30", "2nd 30"].includes(slot.targetGroup)) return;

    // Extract batch year for query (e.g. "2024 Series" -> "24")
    const batchYear = slot.series ? slot.series.substring(2, 4) : "";
    
    // Find students in this department & batch
    const query = { role: "student", department: slot.department };
    if (batchYear) {
      query.batch = { $regex: new RegExp(batchYear, "i") };
    }
    
    const students = await User.find(query);
    
    const targetStudents = students.filter(u => {
      if (!u.rollNo || u.rollNo.length < 3) return false;
      const rollEnd = parseInt(u.rollNo.slice(-3), 10);
      if (slot.targetGroup === "1st 30") return rollEnd <= 30;
      if (slot.targetGroup === "2nd 30") return rollEnd > 30;
      return false;
    });

    if (targetStudents.length > 0) {
      const notifs = targetStudents.map(student => ({
        recipientId: student._id,
        recipientRole: "student",
        title: "Routine Split Lab Updated",
        message: `Your sessional routine for ${slot.courseCode} on ${slot.dayOfWeek} has been updated by the admin.`,
        type: "general",
        meta: {
          courseCode: slot.courseCode,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime
        }
      }));
      await Notification.insertMany(notifs);
    }
  } catch (err) {
    console.error("Error notifying group:", err);
  }
};

const notifyAssessment = async (slot) => {
  try {
    if (!slot.assessmentType || slot.assessmentType === 'None') return;
    
    const batchYear = slot.series ? slot.series.substring(2, 4) : "";
    const query = { role: "student", department: slot.department };
    if (batchYear) query.batch = { $regex: new RegExp(batchYear, "i") };
    
    const students = await User.find(query);
    const targetStudents = students.filter(u => {
      if (slot.targetGroup === "All") return true;
      if (!u.rollNo || u.rollNo.length < 3) return false;
      const rollEnd = parseInt(u.rollNo.slice(-3), 10);
      if (slot.targetGroup === "1st 30") return rollEnd <= 30;
      if (slot.targetGroup === "2nd 30") return rollEnd > 30;
      return false;
    });

    if (targetStudents.length > 0) {
      const notifs = targetStudents.map(student => ({
        recipientId: student._id,
        recipientRole: "student",
        title: `Upcoming ${slot.assessmentType}: ${slot.courseCode}`,
        message: `An assessment (${slot.assessmentType}) has been scheduled for ${slot.courseCode} on ${slot.dayOfWeek}. ${slot.assessmentInfo ? 'Details: ' + slot.assessmentInfo : ''}`,
        type: "exam_notice",
        meta: { courseCode: slot.courseCode, dayOfWeek: slot.dayOfWeek }
      }));
      await Notification.insertMany(notifs);
    }
  } catch (err) {
    console.error("Error notifying assessment:", err);
  }
};

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
        filter.series = { $regex: new RegExp(user.batch.slice(-2), "i") };
      }
      
      const userGroup = getStudentGroup(user.rollNo);
      filter.$or = [
        { targetGroup: "All" },
        { targetGroup: userGroup },
        { targetGroup: { $exists: false } }
      ];
    } else if (user.role === "faculty") {
      // Do not filter by department for faculty, as they may teach courses in other departments.
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
      const userGroup = getStudentGroup(user.rollNo);
      filter.$or = [
        { targetGroup: "All" },
        { targetGroup: userGroup },
        { targetGroup: { $exists: false } }
      ];
    } else if (user.role === "faculty") {
      // Do not filter by department for faculty, as they may teach courses in other departments.
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
      const userGroup = getStudentGroup(user.rollNo);
      filter.$or = [
        { targetGroup: "All" },
        { targetGroup: userGroup },
        { targetGroup: { $exists: false } }
      ];
    } else if (user.role === "faculty") {
      // Do not filter by department for faculty, as they may teach courses in other departments.
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

// POST /api/routine -> Add new routine slot (Admin only)
router.post("/", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const newSlot = new ClassSchedule(req.body);
    await newSlot.save();
    
    // Notify targeted group
    await notifyGroup(newSlot);

    res.status(201).json({ message: "Routine slot added", slot: newSlot });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/routine/:id -> Update routine slot (Admin only)
router.put("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const oldSlot = await ClassSchedule.findById(req.params.id);
    const updatedSlot = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSlot) return res.status(404).json({ error: "Slot not found" });
    
    // Notify targeted group
    await notifyGroup(updatedSlot);

    // Notify assessment if it was newly added or changed
    if (oldSlot) {
      const assessmentChanged = oldSlot.assessmentType !== updatedSlot.assessmentType && updatedSlot.assessmentType !== 'None';
      const infoChanged = oldSlot.assessmentInfo !== updatedSlot.assessmentInfo && updatedSlot.assessmentType !== 'None';
      if (assessmentChanged || infoChanged) {
        await notifyAssessment(updatedSlot);
      }
    }
    
    res.json({ message: "Routine slot updated", slot: updatedSlot });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/routine/:id -> Delete routine slot (Admin only)
router.delete("/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
  try {
    const deletedSlot = await ClassSchedule.findByIdAndDelete(req.params.id);
    if (!deletedSlot) return res.status(404).json({ error: "Slot not found" });
    res.json({ message: "Routine slot deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
