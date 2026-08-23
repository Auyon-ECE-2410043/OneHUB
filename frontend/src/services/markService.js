/**
 * File: markService.js
 * Description: Service layer for making API calls related to mark.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const markService = {
  // Faculty/Admin enters or updates marks/grades
  enterMark: async (markData) => {
    const res = await api.post("/marks", markData);
    return res.data.mark;
  },

  // Student gets CT marks for a specific course
  getCourseCTMarks: async (courseId) => {
    const res = await api.get(`/marks/ct/${courseId}`);
    return res.data.marks || [];
  },

  getAcademicSummary: async () => {
    const res = await api.get("/marks/academic-summary");
    return res.data;
  },

  getOfficialResults: async () => {
    const res = await api.get("/marks/official-results");
    return res.data.results || [];
  },

  // Student gets all assignment marks
  getAssignmentMarks: async () => {
    const res = await api.get("/marks/assignment");
    return res.data.marks || [];
  },

  // Student gets all quiz marks
  getQuizMarks: async () => {
    const res = await api.get("/marks/quiz");
    return res.data.marks || [];
  },

  // Student gets all final course grades
  getFinalGrades: async () => {
    const res = await api.get("/marks/final");
    return res.data.marks || [];
  },
};

export default markService;
