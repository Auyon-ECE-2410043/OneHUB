/**
 * File: SystemSettings.js
 * Description: Mongoose database schema definition for SystemSettings.
 * 
 * This file is part of the RUET OneHub Project.
 */


const mongoose = require("mongoose");
const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
});
module.exports = mongoose.model("SystemSettings", systemSettingsSchema);

