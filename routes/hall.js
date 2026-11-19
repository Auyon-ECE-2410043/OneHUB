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

// GET /api/hall/allocation -> Student views allocated room, hall, bed, and roommates
router.get("/allocation", requireAuth, async (req, res) => {
  try {
    const application = await HallApplication.findOne({
      studentId: req.user.id,
      status: "approved",
    }).sort({ createdAt: -1 });

    if (!application || !application.allocatedRoomNumber) {
      return res.json({ allocated: false });
    }

    const hallName = application.allocatedHall || application.preferredHall || "Deshratna Sheikh Hasina Hall";
    const roomNumber = application.allocatedRoomNumber;

    // Find roommates who share the same allocated hall & room
    const roommateApps = await HallApplication.find({
      $or: [{ allocatedHall: hallName }, { preferredHall: hallName }],
      allocatedRoomNumber: roomNumber,
      status: "approved",
      studentId: { $ne: req.user.id },
    }).populate("studentId", "name rollNo department phone email profilePicture batch");

    const roommates = roommateApps.map((app) => ({
      name: app.studentId?.name || app.fullName,
      rollNo: app.studentId?.rollNo || app.rollNo,
      department: app.studentId?.department || app.department,
      phone: app.studentId?.phone || app.contactNumber,
      bedNumber: app.allocatedBedNumber || "Bed",
      batch: app.studentId?.batch || "24",
    }));

    res.json({
      allocated: true,
      hallName,
      roomNumber,
      bedNumber: application.allocatedBedNumber || "Bed-01",
      allottedDate: application.reviewedAt || application.updatedAt,
      roommates,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hall/maintenance -> Fetch maintenance requests
router.get("/maintenance", requireAuth, async (req, res) => {
  try {
    const HallMaintenance = require("../models/HallMaintenance");
    const query = {};
    if (req.user.role === "student") {
      query.studentId = req.user.id;
    } else if (req.query.hallName) {
      query.hallName = req.query.hallName;
    }
    const tickets = await HallMaintenance.find(query)
      .populate("studentId", "name rollNo department phone")
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hall/maintenance -> Student submits a maintenance ticket
router.post("/maintenance", requireAuth, async (req, res) => {
  try {
    const HallMaintenance = require("../models/HallMaintenance");
    const { hallName, roomNumber, category, title, description, priority } = req.body;
    if (!category || !title || !description) {
      return res.status(400).json({ error: "Category, title, and description are required." });
    }

    const ticket = await HallMaintenance.create({
      studentId: req.user.id,
      hallName: hallName || "Residential Hall",
      roomNumber: roomNumber || "N/A",
      category,
      title,
      description,
      priority: priority || "normal",
      status: "Pending",
    });

    res.status(201).json({ message: "Maintenance request submitted successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/hall/maintenance/:id/status -> Hall staff / Provost / Admin updates status
router.patch("/maintenance/:id/status", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    const HallMaintenance = require("../models/HallMaintenance");
    const { status, technicianAssigned, staffNotes } = req.body;
    const update = {};
    if (status) {
      update.status = status;
      if (status === "Resolved") {
        update.resolvedAt = new Date();
        update.resolvedBy = req.user.id;
      }
    }
    if (technicianAssigned !== undefined) update.technicianAssigned = technicianAssigned;
    if (staffNotes !== undefined) update.staffNotes = staffNotes;

    const ticket = await HallMaintenance.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json({ message: "Ticket updated successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;