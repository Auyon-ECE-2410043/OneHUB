/**
 * File: hall.js
 * Description: Provides API endpoints for students to apply for residential halls and admins to manage them.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const HallApplication = require("../models/HallApplication");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/hall/apply -> student submits the hall application (form-data, file required for financial_need)
router.post("/apply", requireAuth, requireRole("student"), upload.single("incomeDocument"), async (req, res) => {
  try {
    const {
      semester, isCurrentResident, category, financialDescription,
      fatherContactNo, motherContactNo, nidNumber,
      hometownInsideRajshahi, cgpa, preferredHall,
    } = req.body;

    // Enforce: financial_need category MUST include the income document
    if (category === "financial_need" && !req.file) {
      return res.status(400).json({
        error: "Income document is required for Financial Need Category applications.",
      });
    }

    const student = await User.findById(req.user.id);

    // Calculate real CGPA securely from the database
    const Mark = require("../models/Mark");
    const { GRADE_POINTS } = require("../utils/ruetOrdinance");
    const finalMarks = await Mark.find({ studentId: req.user.id, type: "final" }).populate("courseId");
    
    let cumulativeCredits = 0;
    let cumulativeEarnedPoints = 0;
    for (const mark of finalMarks) {
      if (!mark.courseId || !mark.grade) continue;
      const point = GRADE_POINTS[mark.grade];
      if (point !== undefined && mark.courseId.credit > 0) {
        cumulativeCredits += mark.courseId.credit;
        cumulativeEarnedPoints += mark.courseId.credit * point;
      }
    }
    const realCgpa = cumulativeCredits > 0 ? parseFloat((cumulativeEarnedPoints / cumulativeCredits).toFixed(2)) : 0.0;


    let incomeDocumentUrl = null;
    if (req.file) {
      const isPdf = req.file.mimetype === "application/pdf";
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const result = await cloudinary.uploader.upload(base64, {
        resource_type: isPdf ? "raw" : "image",
        folder: "onehub_hall_income_docs",
      });
      incomeDocumentUrl = result.secure_url;
    }

    const isInsideRajshahi = hometownInsideRajshahi === "true" || hometownInsideRajshahi === true;

    const application = await HallApplication.create({
      studentId: student._id,
      semester,
      fullName: student.name,
      rollNo: student.rollNo,
      contactNumber: student.phone,
      gender: student.gender,
      department: student.department,
      isCurrentResident: isCurrentResident === "true" || isCurrentResident === true,
      category,
      incomeDocumentUrl,
      financialDescription: financialDescription || "",
      fatherContactNo,
      motherContactNo,
      nidNumber,
      hometownInsideRajshahi: isInsideRajshahi,
      cgpa: realCgpa,
      preferredHall,
      status: isInsideRajshahi ? "flagged_ineligible" : "pending_review",
      flaggedReason: isInsideRajshahi ? "Hometown reported as inside Rajshahi — requires NID verification" : "",
    });

    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/my-application -> student checks their own status
router.get("/my-application", requireAuth, async (req, res) => {
  try {
    const application = await HallApplication.findOne({ studentId: req.user.id }).sort({ createdAt: -1 });
    if (!application) return res.status(404).json({ error: "No hall application found" });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/applications -> admin views all applications (optionally filter by status)
router.get("/applications", requireAuth, requireRole("admin", "hall_admin"), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const applications = await HallApplication.find(filter).sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hall/:id/review -> admin approves/rejects, optionally assigns a room
router.put("/:id/review", requireAuth, requireRole("admin", "hall_admin"), async (req, res) => {
  try {
    const { status, allocatedRoomNumber, flaggedReason } = req.body;

    const application = await HallApplication.findByIdAndUpdate(
      req.params.id,
      {
        status,
        allocatedRoomNumber: allocatedRoomNumber || null,
        flaggedReason: flaggedReason || "",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;