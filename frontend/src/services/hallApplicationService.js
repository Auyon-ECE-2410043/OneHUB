/**
 * File: hallApplicationService.js
 * Description: Service layer for making API calls related to hallApplication.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const hallApplicationService = {
  // Student submits hall application with optional/required income document
  applyHall: async (formData) => {
    const res = await api.post("/hall/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.application;
  },

  // Student gets their current hall application
  getMyApplication: async () => {
    const res = await api.get("/hall/my-application");
    return res.data.application;
  },

  // Admin / Hall Admin gets all hall applications
  getAllApplications: async (status = "") => {
    const res = await api.get(`/hall/applications${status ? `?status=${status}` : ""}`);
    return res.data.applications || [];
  },

  // Admin / Hall Admin reviews application
  reviewApplication: async (id, reviewData) => {
    const res = await api.put(`/hall/${id}/review`, reviewData);
    return res.data.application;
  },
};

export default hallApplicationService;
