const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    type: { type: String, enum: ["holiday", "vacation", "event"], default: "holiday" },
    classesSuspended: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);
