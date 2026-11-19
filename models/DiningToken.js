const mongoose = require("mongoose");

const diningTokenSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  mealType: {
    type: String,
    enum: ["Lunch", "Dinner", "Grand Feast", "Special Dinner"],
    required: true,
  },
  isGrandFeast: {
    type: Boolean,
    default: false,
  },
  guestTokensCount: {
    type: Number,
    default: 0,
  },
  guestNames: [{ type: String }],
  hallName: {
    type: String,
    default: "Shahid Abdul Hamid Hall",
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

