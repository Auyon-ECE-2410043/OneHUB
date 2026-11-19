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
const LabProgress = require("../models/LabProgress");
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

// GET /api/courses/:id -> Single course details with resources and experiments
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/resources -> Add resource (Faculty, CR, Admin)
router.post("/:id/resources", requireAuth, async (req, res) => {
  try {
    const { title, type, url, description } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: "Title and Resource URL are required." });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Determine uploader role label
    let uploaderRole = req.user.role || "student";
    let uploaderLabel = req.user.name || "Course Contributor";
    if (req.user.isCR) {
      uploaderLabel += " (Class Representative)";
      uploaderRole = "cr";
    } else if (req.user.role === "faculty") {
      uploaderLabel += " (Faculty)";
    } else if (req.user.role === "admin") {
      uploaderLabel += " (Admin)";
    }

    const newResource = {
      title,
      type: type || "slides",
      url,
      description: description || "",
      uploadedBy: uploaderLabel,
      uploaderRole,
      createdAt: new Date(),
    };

    course.resources.unshift(newResource);
    await course.save();

    res.status(201).json({ message: "Resource added successfully", resource: course.resources[0], resources: course.resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id/resources/:resourceId -> Delete resource
router.delete("/:id/resources/:resourceId", requireAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    course.resources = course.resources.filter(
      (r) => r._id.toString() !== req.params.resourceId
    );
    await course.save();

    res.json({ message: "Resource removed successfully", resources: course.resources });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/experiments -> Add or update experiments (Faculty, Admin)
router.post("/:id/experiments", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { expNo, title, description, sheetUrl, dateConducted, maxMarks } = req.body;
    if (!expNo || !title) {
      return res.status(400).json({ error: "Experiment number and title are required." });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const existingIdx = course.experiments.findIndex((e) => e.expNo === Number(expNo));
    const expData = {
      expNo: Number(expNo),
      title,
      description: description || "",
      sheetUrl: sheetUrl || "",
      dateConducted: dateConducted || "",
      maxMarks: Number(maxMarks) || 20,
    };

    if (existingIdx >= 0) {
      course.experiments[existingIdx] = expData;
    } else {
      course.experiments.push(expData);
      course.experiments.sort((a, b) => a.expNo - b.expNo);
    }

    await course.save();
    res.json({ message: "Experiment saved successfully", experiments: course.experiments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/courses/:id/experiments/progress -> Get student's experiment progress
router.get("/:id/experiments/progress", requireAuth, async (req, res) => {
  try {
    const studentId = req.query.studentId || req.user.id;
    const progress = await LabProgress.find({
      courseId: req.params.id,
      studentId,
    }).sort({ expNo: 1 });

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/experiments/:expNo/status -> Submit report or evaluate
router.post("/:id/experiments/:expNo/status", requireAuth, async (req, res) => {
  try {
    const expNo = Number(req.params.expNo);
    const { reportUrl, status, marksObtained, feedback, studentId } = req.body;

    const targetStudentId = (req.user.role === "faculty" || req.user.role === "admin") && studentId
      ? studentId
      : req.user.id;

    const update = {
      courseId: req.params.id,
      studentId: targetStudentId,
      expNo,
    };

    if (reportUrl !== undefined) {
      update.reportUrl = reportUrl;
      update.submittedAt = new Date();
      update.status = "submitted";
    }

    if (status !== undefined) {
      update.status = status;
    }

    if (req.user.role === "faculty" || req.user.role === "admin") {
      if (marksObtained !== undefined) update.marksObtained = Number(marksObtained);
      if (feedback !== undefined) update.feedback = feedback;
      if (marksObtained !== undefined) {
        update.status = "evaluated";
        update.evaluatedBy = req.user.id;
        update.evaluatedAt = new Date();
      }
    }

    const doc = await LabProgress.findOneAndUpdate(
      { courseId: req.params.id, studentId: targetStudentId, expNo },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Lab progress updated", progress: doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;