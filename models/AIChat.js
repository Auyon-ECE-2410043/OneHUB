const mongoose = require("mongoose");

const aiChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    messages: { type: Array, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIChat", aiChatSchema);
