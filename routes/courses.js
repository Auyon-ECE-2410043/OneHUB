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

// GET /api/courses/assigned -> Fixed course list for student's batch, department, and semester
router.get("/assigned", requireAuth, async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const semester = req.query.semester;
    const filter = { batch: student.batch, department: student.department };
    if (semester) filter.semester = semester;

    const assignment = await CourseAssignment.findOne(filter).populate("courseIds").sort({ createdAt: -1 });

    let courses = [];
    let assignedSemester = semester || "1-1";

    if (assignment) {
      courses = assignment.courseIds;
      assignedSemester = assignment.semester;
    } else if (semester) {
      // Fallback: automatically fetch courses for this department and semester from the global catalog
      courses = await Course.find({ department: student.department, semester: semester });
      assignedSemester = semester;
    } else {
      return res.status(404).json({ error: "No course assignment found for this batch/department/semester" });
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