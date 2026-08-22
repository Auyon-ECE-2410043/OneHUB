const mongoose = require("mongoose");
const ClassSchedule = require("../models/ClassSchedule");

const ECE_ROUTINE_DATA = [
  // ==========================================
  // SATURDAY
  // ==========================================
  // 2nd Year Odd (2024 Series / 2-1)
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Saturday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2104", roomOrLab: "LAB-1", teacherInitials: ["MFA", "NIS"], type: "sessional" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Saturday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2105", roomOrLab: "R-403", teacherInitials: ["MKG", "MI"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Saturday", startTime: "11:40", endTime: "12:30", courseCode: "Math 2117", roomOrLab: "R-403", teacherInitials: ["MZH"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Saturday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2111", roomOrLab: "R-403", teacherInitials: ["NRP", "MNT"], type: "theory" },

  // ==========================================
  // SUNDAY
  // ==========================================
  // 2nd Year Odd (2024 Series / 2-1)
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Sunday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2103", roomOrLab: "R-403", teacherInitials: ["MFA", "NIS"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Sunday", startTime: "11:40", endTime: "12:30", courseCode: "Chem 2117", roomOrLab: "R-403", teacherInitials: ["SR"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Sunday", startTime: "12:30", endTime: "13:20", courseCode: "Math 2117", roomOrLab: "R-403", teacherInitials: ["MZH"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Sunday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 2106/2112", roomOrLab: "LAB-14/LAB-2", teacherInitials: ["MKG", "MI", "NRP", "MNT"], type: "sessional" },

  // ==========================================
  // MONDAY
  // ==========================================
  // 2nd Year Odd (2024 Series / 2-1)
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Monday", startTime: "08:00", endTime: "10:30", courseCode: "ECE 2104", roomOrLab: "LAB-1", teacherInitials: ["MFA", "NIS"], type: "sessional" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Monday", startTime: "10:50", endTime: "11:40", courseCode: "Chem 2117", roomOrLab: "R-404", teacherInitials: ["SR"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Monday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 2111", roomOrLab: "R-404", teacherInitials: ["NRP", "MNT"], type: "theory" },

  // ==========================================
  // TUESDAY
  // ==========================================
  // 2nd Year Odd (2024 Series / 2-1)
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Tuesday", startTime: "09:40", endTime: "10:30", courseCode: "ECE 2103", roomOrLab: "R-403", teacherInitials: ["MFA", "NIS"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Tuesday", startTime: "10:50", endTime: "11:40", courseCode: "Chem 2117", roomOrLab: "R-404", teacherInitials: ["AAI"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Tuesday", startTime: "11:40", endTime: "12:30", courseCode: "Math 2117", roomOrLab: "R-404", teacherInitials: ["MZA"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Tuesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2105", roomOrLab: "R-404", teacherInitials: ["MKG", "MI"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Tuesday", startTime: "14:30", endTime: "17:00", courseCode: "ECE 2100", roomOrLab: "LAB-All", teacherInitials: ["ALL Faculty"], type: "project" },

  // ==========================================
  // WEDNESDAY
  // ==========================================
  // 2nd Year Odd (2024 Series / 2-1)
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Wednesday", startTime: "08:00", endTime: "10:30", courseCode: "Chem 2118", roomOrLab: "LAB-6", teacherInitials: ["SR", "AAI"], type: "sessional" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Wednesday", startTime: "10:50", endTime: "11:40", courseCode: "ECE 2103", roomOrLab: "R-404", teacherInitials: ["MFA", "NIS"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Wednesday", startTime: "11:40", endTime: "12:30", courseCode: "ECE 2105", roomOrLab: "R-404", teacherInitials: ["MKG", "MI"], type: "theory" },
  { department: "ECE", semester: "2-1", series: "2024 Series", dayOfWeek: "Wednesday", startTime: "12:30", endTime: "13:20", courseCode: "ECE 2111", roomOrLab: "R-404", teacherInitials: ["NRP", "MNT"], type: "theory" },
];

async function seedRoutine() {
  await ClassSchedule.deleteMany({ department: "ECE", semester: "2-1" });
  await ClassSchedule.insertMany(ECE_ROUTINE_DATA);
  console.log("RUET ECE 2-1 Class Routine Seeded Successfully!");
}

module.exports = { seedRoutine, ECE_ROUTINE_DATA };
