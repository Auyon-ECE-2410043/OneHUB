const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const DiningToken = require("../models/DiningToken");
const DiningWallet = require("../models/DiningWallet");
const User = require("../models/User");

// Get or create wallet
const getOrCreateWallet = async (studentId) => {
  let wallet = await DiningWallet.findOne({ studentId });
  if (!wallet) {
    wallet = await DiningWallet.create({ studentId, deposit: 0, withdrawn: 0 });
  }
  return wallet;
};

// Get student wallet and tokens
router.get("/dashboard", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const tokens = await DiningToken.find({ studentId: req.user.id }).sort({ date: -1 });
    const wallet = await getOrCreateWallet(req.user.id);

    res.json({
      wallet,
      tokens
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Top up wallet
router.post("/topup", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const wallet = await getOrCreateWallet(req.user.id);
    wallet.deposit += Number(amount);
    await wallet.save();

    res.json({ message: "Wallet recharged successfully!", wallet });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Purchase token
router.post("/purchase", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { mealType, date } = req.body;
    
    // Check wallet balance
    const wallet = await getOrCreateWallet(req.user.id);
    if (wallet.balance < 40) {
      return res.status(400).json({ error: "Insufficient balance. Please recharge your wallet." });
    }

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

    // Deduct from wallet
    wallet.withdrawn += 40;
    await wallet.save();

    res.status(201).json({ message: "Token purchased successfully!", token, wallet });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

