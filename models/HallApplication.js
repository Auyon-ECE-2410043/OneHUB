const mongoose = require("mongoose");

const HALL_NAMES = [
  "Shahid President Ziaur Rahman Hall",
  "Shahid Lt. Selim Hall",
  "Shahid Shahidul Islam Hall",
  "Shahid Abdul Hamid Hall",
  "Bangabandhu Sheikh Mujibur Rahman Hall",
  "Sher E Bangla A K Fazlul Haque Hall",
  "Tin Shed Hall (Extension)",
  "Deshratna Sheikh Hasina Hall",
  "Female Hall 1",
  "Female Hall 2",
];

const hallApplicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    semester: { type: String, required: true },

    // Auto-filled snapshot from profile at submission time
    fullName: { type: String, required: true },
    rollNo: { type: String },
    contactNumber: { type: String },
    gender: { type: String },
    department: { type: String },

    isCurrentResident: { type: Boolean, required: true }, // "Are you a resident of a RUET Hall?"
    category: { type: String, enum: ["merit", "financial_need"], required: true },

    // Only relevant when category === "financial_need"
    incomeDocumentUrl: { type: String, default: null },
    financialDescription: { type: String, default: "" },

    fatherContactNo: { type: String, required: true },
    motherContactNo: { type: String, required: true },
    nidNumber: { type: String, required: true },
    hometownInsideRajshahi: { type: Boolean, required: true },
    cgpa: { type: Number, required: true },
    preferredHall: { type: String, enum: HALL_NAMES, required: true },

    status: {
      type: String,
      enum: ["pending_review", "flagged_ineligible", "approved", "rejected"],
      default: "pending_review",
    },
    flaggedReason: { type: String, default: "" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    allocatedRoomNumber: { type: String, default: null },
  },
  { timestamps: true }
);

hallApplicationSchema.index({ studentId: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("HallApplication", hallApplicationSchema);
module.exports.HALL_NAMES = HALL_NAMES;