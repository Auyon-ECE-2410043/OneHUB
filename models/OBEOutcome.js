const mongoose = require("mongoose");

const obeOutcomeSchema = new mongoose.Schema({
  department: { type: String, required: true }, // e.g., "ECE"
  type: { type: String, enum: ["PO", "PEO"], required: true },
  code: { type: String, required: true }, // e.g., "PO1"
  title: { type: String, required: true }, // e.g., "Engineering Knowledge"
  description: { type: String, required: true },
  bloomLevels: [{ type: String }], // Optional mapping to specific cognitive domains
  knowledgeProfiles: [{ type: String }], // e.g., "WK1", "WK2" based on Washington Accord
}, { timestamps: true });

// Ensure uniqueness per department and code
obeOutcomeSchema.index({ department: 1, type: 1, code: 1 }, { unique: true });

module.exports = mongoose.model("OBEOutcome", obeOutcomeSchema);
