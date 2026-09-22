/**
 * File: settings.js
 * Description: Manages global system settings like maintenance mode and feature toggles.
 * 
 * This file is part of the RUET OneHub Project.
 */

const express = require("express");
const router = express.Router();
const SystemSettings = require("../models/SystemSettings");
const { requireAuth, requireRole } = require("../middleware/auth");

const defaultFeatures = {
  routine: true,
  courses: true,
  registration: true,
  attendance: true,
  marks: true,
  cgpa: true,
  fees: true,
  hall: true,
  clearance: true,
  medical: true,
  notices: true,
  faculty: true,
  calendar: true,
  obe: true,
  dining: true,
  ai: true,
  latex: true
};

router.get("/", async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ maintenanceMode: false, features: defaultFeatures });
    
    // Merge existing features with defaults in case of new additions
    const mergedFeatures = { ...defaultFeatures, ...((settings.features || {}).toJSON ? settings.features.toJSON() : settings.features) };
    
    res.json({
      ...settings.toObject(),
      features: mergedFeatures
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/maintenance", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ maintenanceMode: false, features: defaultFeatures });
    
    settings.maintenanceMode = !settings.maintenanceMode;
    await settings.save();
    
    res.json({ message: "Maintenance mode toggled", maintenanceMode: settings.maintenanceMode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle a specific feature
router.post("/feature", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { featureKey, enabled } = req.body;
    let settings = await SystemSettings.findOne();
    if (!settings) settings = await SystemSettings.create({ maintenanceMode: false, features: defaultFeatures });
    
    // Validate if it's a known feature
    if (Object.keys(defaultFeatures).includes(featureKey)) {
      // Ensure features object exists
      if (!settings.features) {
        settings.features = { ...defaultFeatures };
      }
      
      settings.features[featureKey] = enabled;
      settings.markModified('features'); // Tell mongoose the nested object changed
      await settings.save();
      
      res.json({ 
        message: `Feature ${featureKey} is now ${enabled ? 'enabled' : 'disabled'}`, 
        features: settings.features 
      });
    } else {
      res.status(400).json({ error: "Invalid feature key" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
