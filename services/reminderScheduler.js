const cron = require("node-cron");
const ClassSchedule = require("../models/ClassSchedule");
const User = require("../models/User");
const Notification = require("../models/Notification");

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Formats HH:mm 24-hour time to friendly 12-hour AM/PM string
 */
function formatTime12h(time24) {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mStr} ${ampm}`;
}

/**
 * Checks for upcoming classes in 10 minutes and sends reminders
 */
async function checkAndSendClassReminders() {
  try {
    // Current time in Bangladesh (UTC+6)
    const now = new Date();
    const bdTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
    const bdTime = new Date(bdTimeStr);

    const currentDay = DAYS[bdTime.getDay()];

    // Only RUET class days (Saturday to Wednesday)
    if (!["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"].includes(currentDay)) {
      return;
    }

    // Look ahead 5 minutes
    const targetTime = new Date(bdTime.getTime() + 5 * 60 * 1000);
    const targetHours = String(targetTime.getHours()).padStart(2, "0");
    const targetMinutes = String(targetTime.getMinutes()).padStart(2, "0");
    const targetTime24 = `${targetHours}:${targetMinutes}`; // "09:40"

    // Find all classes starting at this exact target time
    const upcomingSlots = await ClassSchedule.find({
      dayOfWeek: currentDay,
      startTime: targetTime24,
    });

    if (upcomingSlots.length === 0) return;

    console.log(`[Class Reminder] Found ${upcomingSlots.length} class(es) starting at ${targetTime24} (${currentDay})`);

    for (const slot of upcomingSlots) {
      const formattedStart = formatTime12h(slot.startTime);
      const teacherList = slot.teacherInitials && slot.teacherInitials.length > 0
        ? slot.teacherInitials.join(" & ")
        : "Course Teacher";

      // -------------------------------------------------------------
      // 1. NOTIFY STUDENTS ENROLLED IN THIS BATCH / SEMESTER
      // -------------------------------------------------------------
      const seriesYear = slot.series.split(" ")[0]; // "2024"
      const shortYear = seriesYear.length === 4 ? seriesYear.slice(2) : seriesYear; // "24"
      
      const students = await User.find({
        role: "student",
        department: slot.department,
        batch: { $regex: new RegExp(`^(${seriesYear}|${shortYear})`, "i") }, // Matches '2024', '24', '2024-2025'
      });

      const studentTitle = `⏳ Class in 5 Mins: ${slot.courseCode}`;
      const studentMessage = `Your ${slot.courseCode} class will start in 5 mins (${formattedStart}) at Room/Lab: ${slot.roomOrLab}. Teacher: ${teacherList}.`;

      for (const student of students) {
        // Prevent duplicate notification in the last 15 minutes
        const alreadySent = await Notification.findOne({
          recipientId: student._id,
          "meta.courseCode": slot.courseCode,
          "meta.startTime": slot.startTime,
          "meta.dayOfWeek": slot.dayOfWeek,
          createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
        });

        if (!alreadySent) {
          await Notification.create({
            recipientId: student._id,
            recipientRole: "student",
            title: studentTitle,
            message: studentMessage,
            type: "class_reminder",
            meta: {
              courseCode: slot.courseCode,
              roomOrLab: slot.roomOrLab,
              startTime: slot.startTime,
              semester: slot.semester,
              dayOfWeek: slot.dayOfWeek,
            },
          });
        }
      }

      // -------------------------------------------------------------
      // 2. NOTIFY APPOINTED FACULTY MEMBERS
      // -------------------------------------------------------------
      const facultyMembers = await User.find({
        role: "faculty",
        department: slot.department,
        teacherAcronym: { $in: slot.teacherInitials },
      });

      const teacherTitle = `⏳ Teaching Reminder: ${slot.courseCode} in 5 Mins`;
      const teacherMessage = `Your ${slot.courseCode} class with ${shortYear} series will start in 5 mins (${formattedStart}) at Room/Lab: ${slot.roomOrLab}.`;

      for (const teacher of facultyMembers) {
        const alreadySentTeacher = await Notification.findOne({
          recipientId: teacher._id,
          "meta.courseCode": slot.courseCode,
          "meta.startTime": slot.startTime,
          "meta.dayOfWeek": slot.dayOfWeek,
          createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
        });

        if (!alreadySentTeacher) {
          await Notification.create({
            recipientId: teacher._id,
            recipientRole: "faculty",
            title: teacherTitle,
            message: teacherMessage,
            type: "class_reminder",
            meta: {
              courseCode: slot.courseCode,
              roomOrLab: slot.roomOrLab,
              startTime: slot.startTime,
              semester: slot.semester,
              dayOfWeek: slot.dayOfWeek,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error("[Class Reminder Engine Error]:", err.message);
  }
}

/**
 * Initializes the background scheduler (runs every minute: "* * * * *")
 */
function initReminderScheduler() {
  console.log("Class Routine Reminder Scheduler initialized (running every minute)");
  cron.schedule("* * * * *", () => {
    checkAndSendClassReminders();
  });
}

module.exports = {
  initReminderScheduler,
  checkAndSendClassReminders,
};
