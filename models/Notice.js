const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    attachmentUrl: { type: String, default: null },
    attachmentType: { type: String, enum: ["none", "image", "pdf"], default: "none" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notice", noticeSchema);