/**
 * File: notices.js
 * Description: Manages the notice board, allowing admins to post announcements.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Notice = require("../models/Notice");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

async function uploadFileToCloudinary(file) {
  const isPdf = file.mimetype === "application/pdf";
  const base64 = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(base64, {
    resource_type: isPdf ? "raw" : "image",
    folder: "onehub_notices",
  });
  return { url: result.secure_url, type: isPdf ? "pdf" : "image" };
}

// POST /api/notices -> faculty/admin posts a notice, optional file attachment
router.post("/", requireAuth, requireRole("faculty", "admin"), upload.single("attachment"), async (req, res) => {
  try {
    const { title, body } = req.body;

    let attachmentUrl = null;
    let attachmentType = "none";

    if (req.file) {
      const uploaded = await uploadFileToCloudinary(req.file);
      attachmentUrl = uploaded.url;
      attachmentType = uploaded.type;
    }

    const notice = await Notice.create({
      title,
      body: body || "",
      attachmentUrl,
      attachmentType,
      postedBy: req.user.id,
    });

    res.status(201).json({ notice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices -> any logged-in student/staff sees all notices, newest first
router.get("/", requireAuth, async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).populate("postedBy", "name role");
    res.json({ notices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notices/:id -> delete a notice posted by the user or if the user is an admin
router.delete('/:id', requireAuth, requireRole('faculty', 'admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    // Only allow deletion if the user is an admin or if they are the one who posted it
    if (req.user.role !== 'admin' && notice.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this notice' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
