const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: { type: Boolean, default: false },
  features: {
    routine: { type: Boolean, default: true },
    courses: { type: Boolean, default: true },
    registration: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    marks: { type: Boolean, default: true },
    cgpa: { type: Boolean, default: true },
    fees: { type: Boolean, default: true },
    hall: { type: Boolean, default: true },
    clearance: { type: Boolean, default: true },
    medical: { type: Boolean, default: true },
    notices: { type: Boolean, default: true },
    faculty: { type: Boolean, default: true },
    calendar: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
