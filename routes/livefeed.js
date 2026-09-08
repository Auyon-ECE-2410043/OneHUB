const express = require("express");
const LiveFeed = require("../models/LiveFeed");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/livefeed -> Fetch active live feed items
router.get("/", requireAuth, async (req, res) => {
  try {
    const feeds = await LiveFeed.find({ active: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ feeds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/livefeed -> Admin adds a new live feed item
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { type, title, content } = req.body;
    if (!type || !title || !content) return res.status(400).json({ error: "Missing fields" });

    const feed = await LiveFeed.create({ type, title, content });
    res.status(201).json({ feed, message: "Live feed posted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/livefeed/:id -> Admin removes a live feed item
router.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    await LiveFeed.findByIdAndDelete(req.params.id);
    res.json({ message: "Live feed removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
