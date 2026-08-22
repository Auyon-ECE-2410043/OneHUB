const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "ruet_onehub_super_secret_key_2026";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, rollNo, registrationNo, department, batch, phone, bloodGroup } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role: role || "student",
      rollNo,
      registrationNo,
      department,
      batch,
      phone,
      bloodGroup
    });
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Missing fields" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid current password" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { phone, bloodGroup } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (phone !== undefined) user.phone = phone;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    await user.save();
    
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/send-otp
router.post("/send-otp", async (req, res) => {
  res.json({ message: "OTP sent successfully (mocked)" });
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  res.json({ message: "OTP verified successfully (mocked)", token: "mock_reset_token" });
});

module.exports = router;
