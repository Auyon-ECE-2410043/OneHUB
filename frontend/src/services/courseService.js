/**
 * File: courseService.js
 * Description: Service layer for making API calls related to course.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const courseService = {
  // Get all courses in catalog (Faculty, Admin)
  getAllCourses: async (page = 1, limit = 500) => {
    const res = await api.get(`/courses/all?page=${page}&limit=${limit}`);
    return Array.isArray(res.data) ? res.data : (res.data.courses || []);
  },

  // Get current assignment for batch, department, semester (Admin)
  getBatchAssignment: async (batch, department, semester) => {
    const res = await api.get(`/courses/admin/assignments?batch=${batch}&department=${department}&semester=${semester}`);
    return res.data.assignment;
  },

  // Get assigned courses for logged-in student
  getAssignedCourses: async (semester) => {
    const url = semester ? `/courses/assigned?semester=${semester}` : "/courses/assigned";
    const res = await api.get(url);
    return res.data; // returns { semester, courses, totalCredit }
  },

  // Get enrolled students for a course (Faculty, Admin)
  getCourseStudents: async (courseId) => {
    const res = await api.get(`/courses/${courseId}/students`);
    return res.data.students || [];
  },

  // Create new course (Admin)
  createCourse: async (courseData) => {
    const res = await api.post("/courses", courseData);
    return res.data.course;
  },

  // Update existing course (Admin)
  updateCourse: async (courseId, courseData) => {
    const res = await api.put(`/courses/${courseId}`, courseData);
    return res.data.course;
  },

  // Assign courses to batch / dept / semester (Admin)
  assignCoursesToBatch: async (assignmentData) => {
    const res = await api.post("/courses/admin/assignments", assignmentData);
    return res.data.assignment;
  },
};

export default courseService;
