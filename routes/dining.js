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
    const { mealType, date, isGrandFeast, guestTokensCount, guestNames } = req.body;
    
    // Determine token unit price
    const isSpecial = isGrandFeast || mealType === "Grand Feast" || mealType === "Special Dinner";
    const unitPrice = isSpecial ? 150 : 40;
    const guests = isSpecial ? (Number(guestTokensCount) || 0) : 0;
    const totalCount = 1 + guests;
    const totalPrice = unitPrice * totalCount;

    // Check wallet balance
    const wallet = await getOrCreateWallet(req.user.id);
    const currentBalance = (wallet.deposit || 0) - (wallet.withdrawn || 0);
    if (currentBalance < totalPrice) {
      return res.status(400).json({
        error: `Insufficient balance. Total required: ৳${totalPrice} (Your balance: ৳${currentBalance}). Please recharge your wallet.`,
      });
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
      price: totalPrice,
      isGrandFeast: isSpecial,
      guestTokensCount: guests,
      guestNames: guestNames || [],
      status: "active",
    });

    // Deduct from wallet
    wallet.withdrawn += totalPrice;
    await wallet.save();

    res.status(201).json({ message: "Token purchased successfully!", token, wallet });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: Fast QR Scanner token verification endpoint
router.post("/admin/scan", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    let { tokenId, qrPayload } = req.body;
    
    // If qrPayload is sent, parse it (may be JSON or raw string)
    if (!tokenId && qrPayload) {
      try {
        const parsed = JSON.parse(qrPayload);
        tokenId = parsed.tokenId || parsed.id || parsed._id;
      } catch (e) {
        tokenId = qrPayload.trim();
      }
    }

    if (!tokenId) {
      return res.status(400).json({ success: false, reason: "MISSING_TOKEN", message: "Token ID is required" });
    }

    const token = await DiningToken.findById(tokenId).populate("studentId", "name rollNo studentId department phone");
    if (!token) {
      return res.status(404).json({ success: false, reason: "NOT_FOUND", message: "Invalid Token: Not found in database." });
    }

    if (token.status === "used") {
      return res.status(409).json({
        success: false,
        reason: "ALREADY_USED",
        message: "Token has ALREADY BEEN SERVED / REDEEMED!",
        token,
        usedAt: token.usedAt,
      });
    }

    if (token.status === "cancelled" || token.status === "expired") {
      return res.status(400).json({
        success: false,
        reason: "INACTIVE",
        message: `Token is ${token.status.toUpperCase()}. Cannot serve meal.`,
        token,
      });
    }

    // Mark as used
    token.status = "used";
    token.usedAt = new Date();
    await token.save();

    res.json({
      success: true,
      reason: "VERIFIED_AND_SERVED",
      message: "Token Verified & Meal Served Successfully!",
      token,
      servedAt: token.usedAt,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Admin: Get all tokens for a specific date
router.get("/admin/tokens", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    const tokens = await DiningToken.find(query)
      .populate("studentId", "name studentId department")
      .sort({ date: -1, createdAt: -1 });
    res.json({ tokens });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: Mark token as used
router.patch("/admin/tokens/:id/use", requireAuth, requireRole("admin", "hall_admin", "faculty"), async (req, res) => {
  try {
    const token = await DiningToken.findById(req.params.id).populate("studentId", "name studentId");
    if (!token) return res.status(404).json({ error: "Token not found" });
    if (token.status !== "active") return res.status(400).json({ error: "Token is not active" });
    token.status = "used";
    token.usedAt = new Date();
    await token.save();
    res.json({ message: "Token marked as used", token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

