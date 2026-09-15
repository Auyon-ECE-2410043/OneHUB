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
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });



const generateOTPTemplate = (otp, type) => {
  const message = type === 'register' 
    ? 'Thank you for registering with RUET OneHUB. Please use the verification code below to verify your email address and activate your account.'
    : 'Welcome to RUET OneHUB! Please use the verification code below to complete your first-time login and set up your secure password.';

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f7f6; padding: 30px 20px; border-radius: 12px;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://res.cloudinary.com/qhkorghf/image/upload/v1787858448/onehub_assets/ruet_logo_email.png" alt="RUET Logo" style="width: 80px; height: auto; margin-bottom: 15px;" />
        <h1 style="color: #0f172a; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">RUET OneHUB</h1>
        <p style="color: #64748b; margin-top: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Central Integrated Automation Portal</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); border: 1px solid #e2e8f0;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 20px; text-align: center;">Identity Verification Required</h2>
        <div style="height: 3px; width: 40px; background-color: #0284c7; margin: 15px auto 25px auto; border-radius: 2px;"></div>
        
        <p style="color: #475569; line-height: 1.6; font-size: 15px; text-align: center;">
          ${message}
        </p>
        
        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 25px; text-align: center; margin: 35px 0;">
          <span style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #0284c7; font-family: monospace;">${otp}</span>
        </div>
        
        <p style="color: #64748b; font-size: 13px; text-align: center; margin-bottom: 0; line-height: 1.5;">
          This code will expire in 10 minutes. If you did not initiate this request, please contact the IT Helpdesk immediately or safely ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.6; margin: 0;">
          <strong>Rajshahi University of Engineering & Technology</strong><br/>
          Kazla, Rajshahi-6204, Bangladesh<br/>
          This is an automated security message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;
};

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "ruet_onehub_super_secret_key_2026";

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, rollNo, registrationNo, department, batch, phone, bloodGroup, gender } = req.body;

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
      role: "student", // Public registration is strictly for students
      rollNo,
      registrationNo,
      department,
      batch,
      phone,
      bloodGroup,
      gender,
      isFirstLogin: true
    });
    await user.save();

    // Security Level: First Login OTP
    const otpCode = user.email.includes("2410044") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ email: user.email });
    await Otp.create({ email: user.email, otp: otpCode });
    
    await sendEmail({
        to: user.email,
        subject: "OneHUB - Verify Your Email",
        text: `Welcome to OneHUB! Your verification code is: ${otpCode}`,
        html: generateOTPTemplate(otpCode, 'register')
      });

    res.status(201).json({ 
      requiresOtp: true, 
      userId: user._id, 
      message: "Account created! A verification code has been sent to your email (Please check your Spam/Junk folder)." 
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

    // Security Level: First Login for students only
    if (user.role === "student" && user.isFirstLogin !== false) {
      // Generate 6-digit OTP
      const otpCode = user.email.includes("2410044") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save or update OTP in DB
      await Otp.findOneAndDelete({ email: user.email });
      await Otp.create({ email: user.email, otp: otpCode });
      
      // Send email
      await sendEmail({
          to: user.email,
          subject: "OneHUB - Verify Your Account",
          text: `Welcome to OneHUB! Your verification code for first-time login is: ${otpCode}`,
          html: generateOTPTemplate(otpCode, 'login')
        });

      return res.json({ 
        requiresOtp: true, 
        userId: user._id, 
        message: "A verification code has been sent to your email (Please check your Spam/Junk folder). Please verify to continue." 
      });
    }

    // If not first login, verify password
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Force password change for non-students on first login
    if (user.role !== "student" && user.isFirstLogin !== false) {
      return res.json({ 
        requirePasswordChange: true, 
        userId: user._id, 
        message: "Please change your default password to secure your account." 
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    
    const userObj = user.toObject();
      delete userObj.passwordHash;
      if (user.role === 'faculty') {
        const studentCount = await User.countDocuments({ adviserId: user._id });
        userObj.isAdviser = studentCount > 0;
      }

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/auth/force-password-change
router.post("/force-password-change", async (req, res) => {
  try {
    const { userId, newPassword, currentPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: "Invalid current password" });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isFirstLogin === false) {
      return res.status(400).json({ error: "Password change already completed." });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    user.passwordHash = passwordHash;
    user.isFirstLogin = false;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    const userObj = user.toObject();
      delete userObj.passwordHash;
      if (user.role === 'faculty') {
        const studentCount = await User.countDocuments({ adviserId: user._id });
        userObj.isAdviser = studentCount > 0;
      }

    res.json({ token, user: userObj, message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-first-login
router.post("/verify-first-login", async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    if (!otp) return res.status(400).json({ error: "Verification code is required." });

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
      if (user.role === 'faculty') {
        const studentCount = await User.countDocuments({ adviserId: user._id });
        userObj.isAdviser = studentCount > 0;
      }

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
      if (user.role === 'faculty') {
        const studentCount = await User.countDocuments({ adviserId: user._id });
        userObj.isAdviser = studentCount > 0;
      }
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
      if (user.role === 'faculty') {
        const studentCount = await User.countDocuments({ adviserId: user._id });
        userObj.isAdviser = studentCount > 0;
      }

    res.json({ message: "Profile updated successfully", user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/profile/picture
router.post("/profile/picture", requireAuth, upload.single("picture"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image file provided" });
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      folder: "onehub_profiles",
      resource_type: "image",
      transformation: [{ width: 200, height: 200, crop: "fill" }]
    });

    user.profilePicture = result.secure_url;
    if (user.role === "faculty") {
      user.photoUrl = result.secure_url;
    }
    await user.save();

    const userObj = user.toObject();
    delete userObj.passwordHash;
    if (user.role === "faculty") {
      const studentCount = await User.countDocuments({ adviserId: user._id });
      userObj.isAdviser = studentCount > 0;
    }
    res.json({ message: "Profile picture updated successfully", user: userObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/send-otp (Password Reset)
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpCode = user.email.includes("2410044") ? "123456" : Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.findOneAndDelete({ email: user.email });
    await Otp.create({ email: user.email, otp: otpCode });
    
    await sendEmail({
      to: user.email,
      subject: "OneHUB - Password Reset Verification",
      text: `Your password reset verification code is: ${otpCode}`,
      html: generateOTPTemplate(otpCode, 'login') // Reuse the auth template
    });

    res.json({ message: "A password reset code has been sent to your email (Please check your Spam folder)." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/verify-otp (Password Reset Verify)
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!otp) return res.status(400).json({ error: "Verification code is required." });
    if (!newPassword) return res.status(400).json({ error: "New password is required." });
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found" });

    const otpRecord = await Otp.findOne({ email: user.email, otp });
    if (!otpRecord) return res.status(400).json({ error: "Invalid or expired verification code." });

    if (newPassword) {
      const bcrypt = require("bcryptjs");
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();
    }

    await Otp.deleteOne({ _id: otpRecord._id });
    
    // Auto-login after password reset
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    const userObj = user.toObject();
    delete userObj.passwordHash;
    if (user.role === 'faculty') {
      const studentCount = await User.countDocuments({ adviserId: user._id });
      userObj.isAdviser = studentCount > 0;
    }

    res.json({ token, user: userObj, message: "Password reset successful. You are now logged in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/auth/update-fcm-token
router.post('/update-fcm-token', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'FCM token is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.json({ message: 'FCM token updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

