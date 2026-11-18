/**
 * File: constants.js
 * Description: React component rendering the constants.js UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

export const ROLES = {
  STUDENT: "student",
  FACULTY: "faculty",
  ADMIN: "admin",
  HALL_ADMIN: "hall_admin",
  HEALTH_STAFF: "health_staff",
};

export const DEPARTMENTS = [
  "ECE", "CSE", "EEE", "ETE", "ME", "IPE", "GCE", "MTE",
  "CE", "URP", "Arch", "MSE", "BECM", "Physics", "Chemistry", "Math", "Humanities", "CME", "ChE"
];

export const SEMESTERS = [
  "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"
];

export const SEMESTER_LABELS = {
  "1-1": "1st Year 1st Term (1-1)",
  "1-2": "1st Year 2nd Term (1-2)",
  "2-1": "2nd Year 1st Term (2-1)",
  "2-2": "2nd Year 2nd Term (2-2)",
  "3-1": "3rd Year 1st Term (3-1)",
  "3-2": "3rd Year 2nd Term (3-2)",
  "4-1": "4th Year 1st Term (4-1)",
  "4-2": "4th Year 2nd Term (4-2)",
};

export const MALE_HALLS = [
  "Shahid President Ziaur Rahman Hall",
  "Shahid Lt. Selim Hall",
  "Shahid Shahidul Islam Hall",
  "Shahid Abdul Hamid Hall",
  "Sher E Bangla A K Fazlul Haque",
  "Tin Shed Hall (Extension)",
  "Bangabandhu Sheikh Mujibur Rahman Hall"
];

export const FEMALE_HALLS = [
  "Female Hall 1",
  "Female Hall 2"
];

export const HALL_NAMES = [...MALE_HALLS, ...FEMALE_HALLS];

export const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Retired Faculty"
];

export const GRADE_POINTS = {
  "A+": 4.0,
  "A": 3.75,
  "A-": 3.5,
  "B+": 3.25,
  "B": 3.0,
  "B-": 2.75,
  "C+": 2.5,
  "C": 2.25,
  "D": 2.0,
  "F": 0.0,
};

export const BATCHES = ["19", "20", "21", "22", "23", "24", "25"];

export const SERIES_DEFAULT_SEMESTER = {
  "25": "1-2",
  "24": "2-2",
  "23": "3-1",
  "22": "3-2",
  "21": "4-2",
};

export const getSeriesDefaultSemester = (user) => {
  let series = "";
  if (user?.batch) {
    const match = String(user.batch).match(/\b(2[0-9])\b|20(2[0-9])/);
    series = match ? (match[1] || match[2]) : String(user.batch).trim();
  }
  if (!series && user?.rollNo && user.rollNo.length >= 2) {
    series = user.rollNo.substring(0, 2);
  }
  return SERIES_DEFAULT_SEMESTER[series] || "2-2";
};
