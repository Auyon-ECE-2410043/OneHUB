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

  // Get single course by ID (includes resources and experiments)
  getCourseById: async (courseId) => {
    const res = await api.get(`/courses/${courseId}`);
    return res.data.course;
  },

  // Add course resource (Faculty, CR, Admin)
  addCourseResource: async (courseId, resourceData) => {
    const res = await api.post(`/courses/${courseId}/resources`, resourceData);
    return res.data;
  },

  // Delete course resource
  deleteCourseResource: async (courseId, resourceId) => {
    const res = await api.delete(`/courses/${courseId}/resources/${resourceId}`);
    return res.data;
  },

  // Add/Update experiment (Faculty, Admin)
  addCourseExperiment: async (courseId, experimentData) => {
    const res = await api.post(`/courses/${courseId}/experiments`, experimentData);
    return res.data;
  },

  // Get student experiment progress
  getExperimentProgress: async (courseId, studentId) => {
    const url = studentId ? `/courses/${courseId}/experiments/progress?studentId=${studentId}` : `/courses/${courseId}/experiments/progress`;
    const res = await api.get(url);
    return res.data.progress || [];
  },

  // Update student experiment submission or marks
  updateExperimentStatus: async (courseId, expNo, statusData) => {
    const res = await api.post(`/courses/${courseId}/experiments/${expNo}/status`, statusData);
    return res.data;
  },
};

export default courseService;
