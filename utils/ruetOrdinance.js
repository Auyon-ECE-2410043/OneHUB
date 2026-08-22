// utils/ruetOrdinance.js

const GRADE_POINTS = {
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

/**
 * Calculates Best 3 out of 4 Class Tests (CTs)
 */
function calculateBest3CT(ctMarks) {
  if (!ctMarks || ctMarks.length === 0) {
    return { best3: [], total: 0, average: 0, droppedIndex: -1 };
  }

  if (ctMarks.length <= 3) {
    const total = ctMarks.reduce((sum, m) => sum + (m || 0), 0);
    const average = ctMarks.length > 0 ? parseFloat((total / ctMarks.length).toFixed(2)) : 0;
    return { best3: ctMarks, total, average, droppedIndex: -1 };
  }

  // Find lowest mark index to drop
  let minIndex = 0;
  let minVal = ctMarks[0];
  for (let i = 1; i < ctMarks.length; i++) {
    if (ctMarks[i] < minVal) {
      minVal = ctMarks[i];
      minIndex = i;
    }
  }

  const best3 = ctMarks.filter((_, idx) => idx !== minIndex);
  const total = best3.reduce((sum, m) => sum + (m || 0), 0);
  const average = parseFloat((total / 3).toFixed(2));

  return { best3, total, average, droppedIndex: minIndex };
}

/**
 * Calculates Attendance marks and eligibility status based on RUET Ordinance
 */
function getAttendanceEvaluation(percentage) {
  let marks = 0;
  let status = "Dis-Collegiate";

  if (percentage >= 90) marks = 8;
  else if (percentage >= 85) marks = 7;
  else if (percentage >= 80) marks = 6;
  else if (percentage >= 75) marks = 5;
  else if (percentage >= 70) marks = 4;
  else if (percentage >= 65) marks = 3;
  else if (percentage >= 60) marks = 2;
  else marks = 0;

  if (percentage >= 75) status = "Collegiate";
  else if (percentage >= 60) status = "Non-Collegiate";
  else status = "Dis-Collegiate";

  return { attendanceMarks: marks, status, isEligibleForExam: percentage >= 60 };
}

/**
 * Calculates Credit-Weighted Semester GPA
 */
function calculateSemesterGPA(courses) {
  let totalCredits = 0;
  let totalEarnedPoints = 0;

  for (const c of courses) {
    const point = GRADE_POINTS[c.grade];
    if (point !== undefined && c.credit > 0) {
      totalCredits += c.credit;
      totalEarnedPoints += c.credit * point;
    }
  }

  const gpa = totalCredits > 0 ? parseFloat((totalEarnedPoints / totalCredits).toFixed(2)) : 0.0;
  return { gpa, totalCredits, totalEarnedPoints };
}

module.exports = {
  GRADE_POINTS,
  calculateBest3CT,
  getAttendanceEvaluation,
  calculateSemesterGPA,
};