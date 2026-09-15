/**
 * File: marks.js
 * Description: Manages student marks, grading, and CGPA calculation.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Mark = require("../models/Mark");
const Course = require("../models/Course");
const Registration = require("../models/Registration");
const { requireAuth, requireRole } = require("../middleware/auth");
const { GRADE_POINTS, calculateBest3CT, calculateSemesterGPA } = require("../utils/ruetOrdinance");

const router = express.Router();

// POST /api/marks -> Single mark entry
router.post("/", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { studentId, courseId, semester, type, instanceNumber, marksObtained, totalMarks, grade } = req.body;

    const update = {
      studentId,
      courseId,
      semester,
      type,
      instanceNumber: instanceNumber || 1,
      enteredBy: req.user.id,
    };

    if (type === "final") {
      update.grade = grade;
      update.gpaPoint = GRADE_POINTS[grade] !== undefined ? GRADE_POINTS[grade] : null;
    } else {
      update.marksObtained = Number(marksObtained);
      update.totalMarks = Number(totalMarks) || (type === "ct" ? 20 : 10);
    }

    const mark = await Mark.findOneAndUpdate(
      { studentId, courseId, semester, type, instanceNumber: instanceNumber || 1 },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ mark });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/marks/bulk -> Teacher submits marks for the whole class
router.post("/bulk", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { courseId, semester, type, instanceNumber, entries } = req.body;

    const results = await Promise.all(
      entries.map((entry) => {
        const update = {
          studentId: entry.studentId,
          courseId,
          semester,
          type,
          instanceNumber: instanceNumber || 1,
          enteredBy: req.user.id,
        };
        if (type === "final") {
          update.grade = entry.grade;
          update.gpaPoint = GRADE_POINTS[entry.grade] !== undefined ? GRADE_POINTS[entry.grade] : null;
        } else {
          update.marksObtained = Number(entry.marksObtained);
          update.totalMarks = Number(entry.totalMarks) || (type === "ct" ? 20 : 10);
        }

        return Mark.findOneAndUpdate(
          { studentId: entry.studentId, courseId, semester, type, instanceNumber: instanceNumber || 1 },
          update,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      })
    );

    res.status(201).json({ count: results.length, records: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/ct/:courseId -> Returns 4 CT slots + Best 3 of 4 calculation
router.get("/ct/:courseId", requireAuth, async (req, res) => {
  try {
    const marks = await Mark.find({
      studentId: req.user.id,
      courseId: req.params.courseId,
      type: "ct",
    }).sort({ instanceNumber: 1 });

    const ctSlots = [null, null, null, null];
    marks.forEach((m) => {
      if (m.instanceNumber >= 1 && m.instanceNumber <= 4) {
        ctSlots[m.instanceNumber - 1] = m.marksObtained;
      }
    });

    const validScores = marks.map((m) => m.marksObtained).filter((v) => v !== null && v !== undefined);
    const best3Calculation = calculateBest3CT(validScores);

    res.json({
      marks,
      ctSlots,
      best3Calculation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/academic-summary -> Full GPA & CGPA calculation for student
router.get("/academic-summary", requireAuth, async (req, res) => {
  try {
    const finalMarks = await Mark.find({ studentId: req.user.id, type: "final" })
      .populate("courseId")
      .sort({ semester: 1 });

    const semestersMap = {};
    for (const mark of finalMarks) {
      if (!mark.courseId) continue;
      const sem = mark.semester;
      if (!semestersMap[sem]) semestersMap[sem] = [];
      semestersMap[sem].push({
        courseCode: mark.courseId.courseCode,
        courseName: mark.courseId.courseName,
        credit: mark.courseId.credit,
        grade: mark.grade,
        gpaPoint: mark.gpaPoint,
      });
    }

    let cumulativeEarnedPoints = 0;
    let cumulativeCredits = 0;
    const semesterResults = [];

    for (const [semester, courses] of Object.entries(semestersMap)) {
      const { gpa, totalCredits, totalEarnedPoints } = calculateSemesterGPA(courses);
      cumulativeEarnedPoints += totalEarnedPoints;
      cumulativeCredits += totalCredits;
      semesterResults.push({
        semester,
        gpa,
        credits: totalCredits,
        courses,
      });
    }

    let cgpa = cumulativeCredits > 0 ? parseFloat((cumulativeEarnedPoints / cumulativeCredits).toFixed(2)) : 0.0;
    
    // Fallback to OfficialResult if no digital marks are present but they have official results
    if (cgpa === 0.0) {
      const OfficialResult = require("../models/OfficialResult");
      const latestOfficial = await OfficialResult.findOne({ studentId: req.user.id }).sort({ semester: -1 });
      if (latestOfficial && latestOfficial.cgpa) {
        cgpa = latestOfficial.cgpa;
      }
    }

    res.json({
      cgpa,
      totalCreditsEarned: cumulativeCredits,
      semesterResults,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/assignment -> Student assignment marks
router.get("/assignment", requireAuth, async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.user.id, type: "assignment" }).populate("courseId");
    res.json({ marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/quiz -> Student quiz marks
router.get("/quiz", requireAuth, async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.user.id, type: "quiz" }).populate("courseId").sort({ instanceNumber: 1 });
    res.json({ marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/final -> Student final grades
router.get("/final", requireAuth, async (req, res) => {
  try {
    const marks = await Mark.find({ studentId: req.user.id, type: "final" }).populate("courseId");
    res.json({ marks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/course-tabulation/:courseId -> Teacher's grade sheet & distribution
router.get("/course-tabulation/:courseId", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { semester } = req.query;
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const filter = { courseIds: course._id, status: "approved" };
    if (semester) filter.semester = semester;

    const registrations = await Registration.find(filter).populate("studentId", "name rollNo department batch");

    const tabulation = [];
    const gradeDistribution = { "A+": 0, "A": 0, "A-": 0, "B+": 0, "B": 0, "B-": 0, "C+": 0, "C": 0, "D": 0, "F": 0 };

    for (const reg of registrations) {
      if (!reg.studentId) continue;
      const studentMarks = await Mark.find({
        studentId: reg.studentId._id,
        courseId: course._id,
      });

      const ctScores = studentMarks
        .filter((m) => m.type === "ct")
        .sort((a, b) => a.instanceNumber - b.instanceNumber);
      const best3 = calculateBest3CT(ctScores.map((m) => m.marksObtained));
      const finalMark = studentMarks.find((m) => m.type === "final");

      if (finalMark && finalMark.grade && gradeDistribution[finalMark.grade] !== undefined) {
        gradeDistribution[finalMark.grade]++;
      }

      tabulation.push({
        student: reg.studentId,
        ctScores,
        best3Average: best3.average,
        finalGrade: finalMark ? finalMark.grade : null,
        gpaPoint: finalMark ? finalMark.gpaPoint : null,
      });
    }

    res.json({
      course,
      totalEnrolled: tabulation.length,
      gradeDistribution,
      tabulation,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/marks/official-results -> Fetch official result summaries
router.get("/official-results", requireAuth, async (req, res) => {
  try {
    const OfficialResult = require("../models/OfficialResult");
    const results = await OfficialResult.find({ studentId: req.user.id }).sort({ semester: 1 });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;