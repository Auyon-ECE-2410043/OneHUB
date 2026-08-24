/**
 * File: auth.js
 * Description: Handles user authentication, login, registration, and profile updates.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "ruet_onehub_super_secret_key_2026";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, rollNo, registrationNo, department, batch, phone, bloodGroup } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Validate Edu Mail for students
    const emailLower = email.toLowerCase();
    if (role === "student" || !role) {
      if (!emailLower.endsWith(".edu") && !emailLower.endsWith(".edu.bd") && !emailLower.endsWith("ruet.ac.bd")) {
        return res.status(400).json({ error: "Please use a valid university educational email (.edu or ruet.ac.bd)." });
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: emailLower });
    if (existingUser) return res.status(400).json({ error: "Email already exists. Please login instead." });

    // Check if roll number already exists
    if (rollNo) {
      const existingRoll = await User.findOne({ rollNo });
      if (existingRoll) return res.status(400).json({ error: "An account with this Roll Number already exists. If this is you, please go to Login." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email: emailLower,
      passwordHash,
      role: role || "student",
      rollNo,
      registrationNo,
      department,
      batch,
      phone,
      bloodGroup,
      isFirstLogin: true
    });
    await user.save();

    // Security Level: First Login OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ email: user.email });
    await Otp.create({ email: user.email, otp: otpCode });
    
    await sendEmail({
      to: user.email,
      subject: "OneHUB - Verify Your Email",
      text: `Welcome to OneHUB! Your verification code is: ${otpCode}\n\nPlease enter this code to verify your email address.`
    });

    res.status(201).json({ 
      requiresOtp: true, 
      userId: user._id, 
      message: "Account created! A verification code has been sent to your email." 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    
    const SystemSettings = require("../models/SystemSettings");
    const settings = await SystemSettings.findOne();
    if (settings && settings.maintenanceMode && user.role !== "admin") {
      return res.status(503).json({ 
        error: "System is under maintenance.", 
        maintenance: true 
      });
    }

    // Security Level: First Login for Students
    if (user.role === "student" && user.isFirstLogin !== false) {
      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save or update OTP in DB
      await Otp.findOneAndDelete({ email: user.email });
      await Otp.create({ email: user.email, otp: otpCode });
      
      // Send email
      await sendEmail({
        to: user.email,
        subject: "OneHUB - Verify Your Account",
        text: `Welcome to OneHUB! Your verification code for first-time login is: ${otpCode}\n\nPlease enter this code to proceed and set up your new secure password.`
      });

      return res.json({ 
        requiresOtp: true, 
        userId: user._id, 
        message: "A verification code has been sent to your email. Please verify to continue." 
      });
    }

    // If not first login, verify password
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-first-login
router.post("/verify-first-login", async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find OTP
    const otpRecord = await Otp.findOne({ email: user.email, otp });
    if (!otpRecord) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    // Hash new password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordHash = passwordHash;
    }

    // Update user
    user.isFirstLogin = false;
    await user.save();

    // Delete OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Login user
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({ token, user: userObj, message: newPassword ? "Password updated successfully." : "Email verified successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.json({ user: userObj });
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
    const { name, phone, fatherContactNo, motherContactNo, bloodGroup, rollNo, batch } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (fatherContactNo !== undefined) user.fatherContactNo = fatherContactNo;
    if (motherContactNo !== undefined) user.motherContactNo = motherContactNo;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup;
    if (rollNo !== undefined) user.rollNo = rollNo;
    if (batch !== undefined) user.batch = batch;
    await user.save();
    
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({ message: "Profile updated successfully", user: userObj });
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
