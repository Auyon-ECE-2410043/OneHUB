const mongoose = require("mongoose");

const liveFeedSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["emergency_blood", "achievement", "campus_alert", "ruet_news"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sourceUrl: { type: String, default: null },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("LiveFeed", liveFeedSchema);
