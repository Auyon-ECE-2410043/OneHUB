/**
 * File: calendarExport.js
 * Description: Utilities for generating universal .ics (iCalendar) and Google Calendar sync links.
 * Compatible with Google Calendar, Apple Calendar, Microsoft Outlook, and Android calendar apps.
 * 
 * Part of the RUET OneHub Project.
 */

// Mapping Day names to RFC 5545 BYDAY codes
const DAY_TO_BYDAY = {
  Saturday: "SA",
  Sunday: "SU",
  Monday: "MO",
  Tuesday: "TU",
  Wednesday: "WE",
  Thursday: "TH",
  Friday: "FR",
};

// Day name to day index (0 = Sunday, 6 = Saturday)
const DAY_TO_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Format a Date object to iCalendar date-time string: YYYYMMDDTHHMMSS
 */
function formatIcsDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Parses time string (e.g. "10:50" or "01:20 PM") into { hours, minutes }
 */
export function parseTimeString(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 };
  
  if (timeStr.includes(" ")) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
    return { hours, minutes: minutes || 0 };
  }

  let [hours, minutes] = timeStr.split(":").map(Number);
  // Auto-convert afternoon times like 1:30 or 2:30 to 13:30, 14:30
  if (hours >= 1 && hours <= 7) hours += 12;
  return { hours, minutes: minutes || 0 };
}

/**
 * Calculate the next upcoming Date object for a given day of week and time
 */
export function getNextDateForDay(dayName, timeStr) {
  const targetDay = DAY_TO_INDEX[dayName];
  if (targetDay === undefined) return new Date();

  const now = new Date();
  const currentDay = now.getDay();
  let dayDiff = targetDay - currentDay;
  if (dayDiff < 0) dayDiff += 7; // Next occurrence

  const { hours, minutes } = parseTimeString(timeStr);
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + dayDiff);
  targetDate.setHours(hours, minutes, 0, 0);

  return targetDate;
}

/**
 * Builds standard RFC 5545 iCalendar (.ics) string for a list of routine classes
 */
export function generateIcsContent(classes, user) {
  const now = new Date();
  const dtstamp = formatIcsDateTime(now) + "Z";
  const userDept = user?.department || "ECE";
  const userBatch = user?.batch || "24";

  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RUET OneHUB//Class Routine Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:RUET Routine (${userDept} Batch '${userBatch})`,
    "X-WR-TIMEZONE:Asia/Dhaka",
  ];

  classes.forEach((c, index) => {
    const byDay = DAY_TO_BYDAY[c.dayOfWeek] || "SA";
    const startDate = getNextDateForDay(c.dayOfWeek, c.startTime);
    const endDate = getNextDateForDay(c.dayOfWeek, c.endTime);

    // If end is before or equal to start, add 50 mins
    if (endDate <= startDate) {
      endDate.setTime(startDate.getTime() + 50 * 60 * 1000);
    }

    const dtStartStr = formatIcsDateTime(startDate);
    const dtEndStr = formatIcsDateTime(endDate);
    const uid = `ruet-routine-${c._id || index}-${startDate.getTime()}@onehub.ruet.ac.bd`;
    const summary = `${c.courseCode}${c.courseName ? `: ${c.courseName}` : ""}`;
    const location = `${c.roomOrLab || "Room TBA"}, Academic Building, RUET`;
    const teachers = Array.isArray(c.teacherInitials) ? c.teacherInitials.join(", ") : c.teacherInitials || "Faculty";
    const description = `Course: ${c.courseCode}\\nTeacher: ${teachers}\\nType: ${c.type || "Theory"}\\nTarget Group: ${c.targetGroup || "All"}\\nDepartment of ${userDept}, RUET OneHUB`;

    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${dtstamp}`);
    ics.push(`DTSTART;TZID=Asia/Dhaka:${dtStartStr}`);
    ics.push(`DTEND;TZID=Asia/Dhaka:${dtEndStr}`);
    ics.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);
    ics.push(`SUMMARY:${summary}`);
    ics.push(`LOCATION:${location}`);
    ics.push(`DESCRIPTION:${description}`);
    ics.push("STATUS:CONFIRMED");

    // 15-Minute Alarm Notification
    ics.push("BEGIN:VALARM");
    ics.push("TRIGGER:-PT15M");
    ics.push("ACTION:DISPLAY");
    ics.push(`DESCRIPTION:Upcoming Class: ${summary} in ${c.roomOrLab || "Room"}`);
    ics.push("END:VALARM");

    ics.push("END:VEVENT");
  });

  ics.push("END:VCALENDAR");
  return ics.join("\r\n");
}

/**
 * Downloads the .ics file to user's device
 */
export function downloadRoutineIcs(classes, user) {
  const content = generateIcsContent(classes, user);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const semName = user?.batch ? `Batch_${user.batch}` : "Semester";
  link.download = `RUET_Class_Routine_${semName}.ics`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/**
 * Builds direct Google Calendar Web URL for a single class slot
 */
export function getGoogleCalendarWebUrl(classItem, user) {
  const startDate = getNextDateForDay(classItem.dayOfWeek, classItem.startTime);
  const endDate = getNextDateForDay(classItem.dayOfWeek, classItem.endTime);

  const formatGoogleDate = (d) => {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const byDay = DAY_TO_BYDAY[classItem.dayOfWeek] || "SA";
  const title = `${classItem.courseCode}: ${classItem.courseName || "Class"}`;
  const location = `${classItem.roomOrLab || "Room TBA"}, RUET`;
  const teachers = Array.isArray(classItem.teacherInitials) ? classItem.teacherInitials.join(", ") : classItem.teacherInitials || "Faculty";
  const details = `Teacher: ${teachers}\nType: ${classItem.type || "Theory"}\nDepartment of ${user?.department || "ECE"}, RUET OneHUB`;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: dates,
    details: details,
    location: location,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
    ctz: "Asia/Dhaka"
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
