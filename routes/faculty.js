const express = require("express");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
// POST /api/faculty/bulk -> admin creates MANY faculty logins at once from a list
router.post("/bulk", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { facultyList, defaultPassword } = req.body;
    // facultyList: [{ name, nameBengali, email, department, designation, phone, officeLocation, isPhdHolder, isHeadOfDept }, ...]

    const results = { created: [], skipped: [] };

    for (const item of facultyList) {
      const existing = await User.findOne({ email: item.email });
      if (existing) {
        results.skipped.push({ email: item.email, reason: "Email already exists" });
        continue;
      }

      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const faculty = await User.create({
        name: item.name,
        nameBengali: item.nameBengali || "",
        email: item.email,
        passwordHash,
        role: "faculty",
        department: item.department,
        designation: item.designation,
        phone: item.phone || "",
        officeLocation: item.officeLocation || "",
        isPhdHolder: !!item.isPhdHolder,
        isHeadOfDept: !!item.isHeadOfDept,
      });
      results.created.push({ id: faculty._id, name: faculty.name, email: faculty.email });
    }

    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/faculty -> View all faculty members (Paginated)
router.get("/", requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { role: "faculty" };

    const faculty = await User.find(query)
      .select("name nameBengali designation department email phone officeLocation isPhdHolder isHeadOfDept isOnLeave photoUrl website firstJoined fieldOfResearch education positionHistory")
      .sort({ designation: 1, name: 1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      faculty,
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

// GET /api/faculty/stats -> counts matching the summary cards (PhD Holder, Professor, etc.)
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const [phdHolder, professor, associateProfessor, assistantProfessor, lecturer] = await Promise.all([
      User.countDocuments({ role: "faculty", isPhdHolder: true }),
      User.countDocuments({ role: "faculty", designation: "Professor" }),
      User.countDocuments({ role: "faculty", designation: "Associate Professor" }),
      User.countDocuments({ role: "faculty", designation: "Assistant Professor" }),
      User.countDocuments({ role: "faculty", designation: "Lecturer" }),
    ]);
    res.json({ phdHolder, professor, associateProfessor, assistantProfessor, lecturer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/faculty -> admin creates a faculty login directly (bulk onboarding from a list)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const {
      name, nameBengali, email, password, department,
      designation, isPhdHolder, isHeadOfDept, phone, officeLocation,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const faculty = await User.create({
      name, nameBengali, email, passwordHash, role: "faculty", department,
      designation, isPhdHolder: !!isPhdHolder, isHeadOfDept: !!isHeadOfDept,
      phone, officeLocation,
    });

    res.status(201).json({
      faculty: { id: faculty._id, name: faculty.name, designation: faculty.designation, email: faculty.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty/:id -> admin updates directory info (leave status, office, designation, etc.)
router.put("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const allowedFields = [
      "nameBengali", "designation", "isPhdHolder", "isHeadOfDept",
      "isOnLeave", "phone", "officeLocation",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const faculty = await User.findOneAndUpdate({ _id: req.params.id, role: "faculty" }, updates, { new: true });
    if (!faculty) return res.status(404).json({ error: "Faculty member not found" });
    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/faculty/:id/photo -> admin uploads/replaces a faculty member's photo
router.put("/:id/photo", requireAuth, requireRole("admin"), upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo file provided" });

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      resource_type: "image",
      folder: "onehub_faculty_photos",
    });

    const faculty = await User.findOneAndUpdate(
      { _id: req.params.id, role: "faculty" },
      { photoUrl: result.secure_url },
      { new: true }
    );
    if (!faculty) return res.status(404).json({ error: "Faculty member not found" });

    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;