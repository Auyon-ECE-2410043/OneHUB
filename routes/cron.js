const express = require("express");
const router = express.Router();
const { checkAndSendClassReminders } = require("../services/reminderScheduler");

// GET /api/cron/reminders
// Can be pinged by cron-job.org or Vercel Cron every minute
router.get("/reminders", async (req, res) => {
  try {
    await checkAndSendClassReminders();
    res.status(200).json({ success: true, message: "Reminders checked and triggered successfully" });
  } catch (error) {
    console.error("Cron API Error:", error);
    res.status(500).json({ success: false, error: "Failed to run reminder engine" });
  }
});

module.exports = router;
