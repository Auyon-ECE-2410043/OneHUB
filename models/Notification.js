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
    recipientRole: { type: String, default: "student" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      default: "general",
    },
    link: { type: String }, // e.g. /admin/registrations or /admin/hall-applications
    meta: {
      courseCode: String,
      roomOrLab: String,
      startTime: String,
      semester: String,
      dayOfWeek: String,
      studentId: String,
      applicationId: String
    },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
