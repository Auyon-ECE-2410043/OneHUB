/**
 * File: courses.js
 * Description: Manages course creation, fetching course details, and syllabus information.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Course = require("../models/Course");
const CourseAssignment = require("../models/CourseAssignment");
const Registration = require("../models/Registration");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// POST /api/courses -> Admin creates a course
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { courseCode, courseName, credit, department, semester, courseType } = req.body;
    const course = await Course.create({ courseCode, courseName, credit, department, semester, courseType });
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/all -> Everyone can view all courses (Paginated)
router.get("/all", requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const isAll = req.query.limit === "all" || parseInt(req.query.limit) >= 500;
    if (isAll) {
      const courses = await Course.find().sort({ courseCode: 1 });
      return res.json({
        courses,
        pagination: {
          total: courses.length,
          page: 1,
          pages: 1
        }
      });
    }

    const skip = (page - 1) * limit;

    const courses = await Course.find()
      .sort({ courseCode: 1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Course.countDocuments();
    
    res.json({
      courses,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to determine active semester based on student series
function getSeriesDefaultSemester(user) {
  let series = "";
  if (user?.batch) {
    const match = String(user.batch).match(/\b(2[0-9])\b|20(2[0-9])/);
    series = match ? (match[1] || match[2]) : String(user.batch).trim();
  }
  if (!series && user?.rollNo && user.rollNo.length >= 2) {
    series = user.rollNo.substring(0, 2);
  }

  const seriesMap = {
    "25": "1-2",
    "24": "2-2",
    "23": "3-1",
    "22": "3-2",
    "21": "4-2",
  };

  return seriesMap[series] || "2-2";
}

// GET /api/courses/assigned -> Fixed course list for student's batch, department, and semester
router.get("/assigned", requireAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const semester = req.query.semester || getSeriesDefaultSemester(student);
    const filter = { batch: student.batch, department: student.department, semester };

    let assignment = await CourseAssignment.findOne(filter).populate("courseIds");
    if (!assignment) {
      assignment = await CourseAssignment.findOne({ department: student.department, semester }).populate("courseIds");
    }

    let courses = [];
    let assignedSemester = semester;

    if (assignment && assignment.courseIds && assignment.courseIds.length > 0) {
      courses = assignment.courseIds;
      assignedSemester = assignment.semester;
    } else {
      // Fallback: automatically fetch courses for this department and semester from the global catalog
      courses = await Course.find({ department: student.department, semester: semester });
      assignedSemester = semester;
    }

    const totalCredit = courses.reduce((sum, c) => sum + (c.credit || 0), 0);
    res.json({ semester: assignedSemester, courses, totalCredit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id/students -> Students enrolled in a course
router.get("/:id/students", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const registrations = await Registration.find({ courseIds: req.params.id, status: "approved" })
      .populate("studentId", "name rollNo department batch");
    const students = registrations.map((r) => r.studentId).filter(Boolean);
    res.json({ count: students.length, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/courses/:id -> Admin updates course
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/admin/assignments -> Admin assigns course list to batch & semester
// GET /api/courses/admin/assignments -> Admin retrieves assigned course list for a batch, department & semester
router.get("/admin/assignments", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { batch, department, semester } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const assignment = await CourseAssignment.findOne(filter).populate("courseIds");
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/admin/assignments", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { batch, department, semester, courseIds } = req.body;
    const assignment = await CourseAssignment.findOneAndUpdate(
      { batch, department, semester },
      { courseIds },
      { upsert: true, new: true }
    ).populate("courseIds");
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;