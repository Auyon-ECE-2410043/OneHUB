/**
 * File: Notification.js
 * Description: Mongoose database schema definition for Notification.
 * 
 * This file is part of the RUET OneHub Project.
 */

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientRole: { type: String, enum: ["student", "faculty", "admin"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["class_reminder", "exam_notice", "fee_due", "general"],
      default: "class_reminder",
    },
    meta: {
      courseCode: String,
      roomOrLab: String,
      startTime: String,
      semester: String,
      dayOfWeek: String,
    },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
