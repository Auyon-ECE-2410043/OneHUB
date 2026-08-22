/**
 * File: attendanceService.js
 * Description: Service layer for making API calls related to attendance.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const attendanceService = {
  // Mark attendance for single student
  markAttendance: async (data) => {
    const res = await api.post("/attendance", data);
    return res.data.record;
  },

  // Mark attendance in bulk for a class roster
  markBulkAttendance: async (bulkData) => {
    const res = await api.post("/attendance/bulk", bulkData);
    return res.data.records || [];
  },

  // Student gets their attendance record for a course
  getCourseAttendance: async (courseId) => {
    const res = await api.get(`/attendance/${courseId}`);
    return res.data; // { records, totalClasses, presentCount, percentage }
  },
};

export default attendanceService;
