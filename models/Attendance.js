const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    semester: { type: String, required: true },
    date: { type: Date, required: true },
    present: { type: Boolean, required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);