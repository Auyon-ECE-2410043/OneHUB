const mongoose = require("mongoose");

const diningTokenSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mealType: {
    type: String,
    enum: ["Lunch", "Dinner"],
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    default: 40,
  },
  status: {
    type: String,
    enum: ["active", "used", "expired", "cancelled"],
    default: "active",
  },
  borderType: {
    type: String,
    default: "Non Residential Border"
  },
  usedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model("DiningToken", diningTokenSchema);

