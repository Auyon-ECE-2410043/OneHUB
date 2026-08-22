
const mongoose = require("mongoose");
const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
});
module.exports = mongoose.model("SystemSettings", systemSettingsSchema);

