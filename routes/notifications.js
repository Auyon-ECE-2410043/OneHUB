/**
 * File: notifications.js
 * Description: Handles pushing and fetching in-app notifications and reminders.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/notifications -> Get all notifications for logged-in user in strict chronological order (latest first)
router.get("/", requireAuth, async (req, res) => {
  try {
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipientId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50),
      Notification.countDocuments({ recipientId: req.user.id, isRead: false }),
    ]);

    res.json({ unreadCount, notifications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read -> Mark single notification as read
router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json({ notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/read-all -> Mark all as read
router.put("/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
