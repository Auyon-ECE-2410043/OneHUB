/**
 * File: userService.js
 * Description: Service layer for making API calls related to user.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const userService = {
  // Get faculty directory
  getFacultyDirectory: async (page = 1, limit = 1000) => {
    const res = await api.get(`/faculty?page=${page}&limit=${limit}`);
    return Array.isArray(res.data) ? res.data : (res.data.faculty || []);
  },

  // Get faculty statistics for summary cards
  getFacultyStats: async () => {
    const res = await api.get("/faculty/stats");
    return res.data;
  },

  // Admin creates faculty member
  createFaculty: async (facultyData) => {
    const res = await api.post("/faculty", facultyData);
    return res.data.faculty;
  },

  // Admin creates faculty in bulk
  bulkCreateFaculty: async (facultyList, defaultPassword) => {
    const res = await api.post("/faculty/bulk", { facultyList, defaultPassword });
    return res.data;
  },

  // Admin updates faculty info
  updateFaculty: async (id, data) => {
    const res = await api.put(`/faculty/${id}`, data);
    return res.data.faculty;
  },

  // Admin uploads faculty photo
  uploadFacultyPhoto: async (id, photoFile) => {
    const formData = new FormData();
    formData.append("photo", photoFile);
    const res = await api.put(`/faculty/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.faculty;
  },

  // Search students (Faculty, Admin)
  searchStudents: async (searchTerm = "") => {
    const res = await api.get(`/students${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`);
    return res.data.students || [];
  },
};

export default userService;
