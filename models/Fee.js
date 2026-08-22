const mongoose = require("mongoose");

const breakdownItemSchema = new mongoose.Schema(
  { label: { type: String, required: true }, amount: { type: Number, required: true } },
  { _id: false }
);

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    registrationId: { type: mongoose.Schema.Types.ObjectId, ref: "Registration", required: true },
    semester: { type: String, required: true },
    feeType: {
      type: String,
      enum: ["registration_fee", "exam_fee", "hall_fee", "extra_fee"],
      required: true,
    },
    label: { type: String, required: true }, // e.g. "Tuition Fee", "Examination Fee", "Hall Fee", "ID Card Fee"
    breakdown: [breakdownItemSchema], // optional detail, e.g. per-course exam fee lines
    amount: { type: Number, required: true },
    status: { type: String, enum: ["due", "paid"], default: "due" },
    dueDate: { type: Date },
    transactionId: { type: String, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fee", feeSchema);