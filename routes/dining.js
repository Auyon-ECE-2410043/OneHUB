const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const DiningToken = require("../models/DiningToken");
const User = require("../models/User");

// Get student wallet and tokens
router.get("/dashboard", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const tokens = await DiningToken.find({ studentId: req.user.id }).sort({ date: -1 });
    
    // Calculate mock wallet based on tokens
    const withdrawn = tokens.length * 40;
    const deposit = 3000; // Mock initial deposit
    const balance = deposit - withdrawn;

    res.json({
      wallet: { deposit, withdrawn, balance },
      tokens
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Purchase token
router.post("/purchase", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { mealType, date } = req.body;
    
    // Check if already purchased
    const existing = await DiningToken.findOne({ studentId: req.user.id, mealType, date });
    if (existing) {
      return res.status(400).json({ error: `You have already purchased ${mealType} for this date.` });
    }

    const token = await DiningToken.create({
      studentId: req.user.id,
      mealType,
      date,
      price: 40
    });

    res.status(201).json({ message: "Token purchased successfully!", token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

