/**
 * File: registrations.js
 * Description: Handles student course registrations for each semester.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Registration = require("../models/Registration");
const CourseAssignment = require("../models/CourseAssignment");
const Fee = require("../models/Fee");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

const PER_CREDIT_FEE = 20;
const EXAM_FEE_THEORY = 50;
const EXAM_FEE_SESSIONAL = 30;

// GET /api/registrations/pending -> Faculty/Admin review pending list
router.get("/pending", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const registrations = await Registration.find({ status: "pending_approval" })
      .populate("studentId", "name rollNo department batch")
      .populate("courseIds")
      .sort({ createdAt: 1 });
    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/registrations -> Student applies for fixed courses
router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { semester, backlogCourseIds } = req.body;
    const student = await User.findById(req.user.id);

    const existingReg = await Registration.findOne({ studentId: student._id, semester });
    if (existingReg) {
      return res.status(400).json({ error: `Registration already submitted for ${semester}` });
    }

    const assignment = await CourseAssignment.findOne({
      batch: student.batch,
      department: student.department,
      semester,
    }).populate("courseIds");

    if (!assignment) {
      return res.status(404).json({ error: "No fixed course list found for your batch and semester" });
    }

    const totalCredit = assignment.courseIds.reduce((sum, c) => sum + (c.credit || 0), 0);

    const registration = await Registration.create({
      studentId: student._id,
      semester,
      academicSession: student.batch,
      previouslyEarnedCredit: student.previouslyEarnedCredit || 0,
      backlogCourseIds: backlogCourseIds || [],
      courseIds: assignment.courseIds.map((c) => c._id),
      totalCredit,
      status: "pending_approval",
    });

    res.status(201).json({ registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations -> Returns all semester registrations for the logged-in student
router.get("/", requireAuth, async (req, res) => {
  try {
    const filter = { studentId: req.user.id };
    if (req.query.semester) filter.semester = req.query.semester;

    const registrations = await Registration.find(filter)
      .populate("courseIds")
      .populate("backlogCourseIds")
      .sort({ createdAt: -1 });

    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations/active -> Latest registration
router.get("/active", requireAuth, async (req, res) => {
  try {
    const registration = await Registration.findOne({ studentId: req.user.id })
      .populate("courseIds")
      .populate("backlogCourseIds")
      .sort({ createdAt: -1 });

    if (!registration) return res.status(404).json({ error: "No registration found" });
    res.json({ registration: updatedRegistration || registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/registrations/:id/approve -> Advisor approves and triggers fee generation
router.put("/:id/approve", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { adviserComment, hallFeeAmount, extraFees, dueDate } = req.body;

    
    const registration = await Registration.findById(req.params.id).populate("courseIds");
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    // Security Check: Only Admin or the specific Student's Adviser can approve
    if (req.user.role === "faculty") {
      const student = await User.findById(registration.studentId);
      if (!student || !student.adviserId || student.adviserId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access Denied: You are not the assigned adviser for this student." });
      }
    }


    if (registration.status === "approved") {
      return res.status(400).json({ error: "Registration is already approved and billed." });
    }

    const billedCredits = Math.ceil(registration.totalCredit);
    const parsedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 1. Tuition/Registration Fee
    const registrationFee = await Fee.create({
      studentId: registration.studentId,
      registrationId: registration._id,
      semester: registration.semester,
      feeType: "registration_fee",
      label: "Tuition / Registration Fee",
      amount: billedCredits * PER_CREDIT_FEE,
      dueDate: parsedDueDate,
      status: "due",
    });
    registration.registrationFeeId = registrationFee._id;

    // 2. Exam Fee
    const examBreakdown = registration.courseIds.map((course) => ({
      label: `${course.courseCode} (${course.courseType})`,
      amount: course.courseType === "theory" ? EXAM_FEE_THEORY : EXAM_FEE_SESSIONAL,
    }));
    const examTotal = examBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const examFee = await Fee.create({
      studentId: registration.studentId,
      registrationId: registration._id,
      semester: registration.semester,
      feeType: "exam_fee",
      label: "Semester Examination Fee",
      breakdown: examBreakdown,
      amount: examTotal,
      dueDate: parsedDueDate,
      status: "due",
    });
    registration.examFeeId = examFee._id;

    // 3. Hall Fee (if resident)
    if (hallFeeAmount && Number(hallFeeAmount) > 0) {
      const hallFee = await Fee.create({
        studentId: registration.studentId,
        registrationId: registration._id,
        semester: registration.semester,
        feeType: "hall_fee",
        label: "Hall Seat & Maintenance Fee",
        amount: Number(hallFeeAmount),
        dueDate: parsedDueDate,
        status: "due",
      });
      registration.hallFeeId = hallFee._id;
    }

    // 4. Extra fees
    const extraFeeDocs = [];
    if (Array.isArray(extraFees)) {
      for (const item of extraFees) {
        if (item.amount && item.label) {
          const extra = await Fee.create({
            studentId: registration.studentId,
            registrationId: registration._id,
            semester: registration.semester,
            feeType: "extra_fee",
            label: item.label,
            amount: Number(item.amount),
            dueDate: parsedDueDate,
            status: "due",
          });
          extraFeeDocs.push(extra);
        }
      }
    }
    registration.extraFeeIds = extraFeeDocs.map((f) => f._id);

    registration.status = "approved";
    registration.approvedBy = req.user.id;
    registration.approvedAt = new Date();
    registration.adviserComment = adviserComment || "";
    await registration.save();

    res.json({ registration: updatedRegistration || registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/registrations/:id/reject
router.put("/:id/reject", requireAuth, requireRole("faculty", "admin"), async (req, res) => {
  try {
    const { adviserComment } = req.body;
    
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ error: "Registration not found" });

    // Security Check: Only Admin or the specific Student's Adviser can reject
    if (req.user.role === "faculty") {
      const student = await User.findById(registration.studentId);
      if (!student || !student.adviserId || student.adviserId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Access Denied: You are not the assigned adviser for this student." });
      }
    }

    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", approvedBy: req.user.id, approvedAt: new Date(), adviserComment: adviserComment || "" },
      { new: true }
    );

    res.json({ registration: updatedRegistration || registration });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
