/**
 * File: settings.js
 * Description: Manages global system settings like maintenance mode.
 * 
 * This file is part of the RUET OneHub Project.
 */


const express = require("express");
const router = express.Router();
const SystemSettings = require("../models/SystemSettings");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ maintenanceMode: false });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/maintenance", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ maintenanceMode: false });
    
    settings.maintenanceMode = !settings.maintenanceMode;
    await settings.save();
    
    res.json({ message: "Maintenance mode toggled", maintenanceMode: settings.maintenanceMode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

