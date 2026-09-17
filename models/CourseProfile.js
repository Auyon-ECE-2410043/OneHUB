const mongoose = require("mongoose");

const coSchema = new mongoose.Schema({
  code: { type: String, required: true }, // e.g., "CO1"
  description: { type: String, required: true },
  bloomLevels: [{ type: String }], // e.g., "C2", "C3"
});

const mappingSchema = new mongoose.Schema({
  coCode: { type: String, required: true }, // References coSchema.code
  poCode: { type: String, required: true }, // References OBEOutcome.code
  correlationLevel: { type: Number, required: true, min: 1, max: 3 } // 1: Low, 2: Medium, 3: High
});

const courseProfileSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  academicSession: { type: String, required: true }, // e.g., "2023-2024"
  cos: [coSchema],
  mappings: [mappingSchema],
  status: { type: String, enum: ["draft", "published"], default: "draft" }
}, { timestamps: true });

// Ensure one profile per course per session
courseProfileSchema.index({ courseId: 1, academicSession: 1 }, { unique: true });

module.exports = mongoose.model("CourseProfile", courseProfileSchema);
