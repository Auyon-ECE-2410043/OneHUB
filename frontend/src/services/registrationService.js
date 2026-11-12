/**
 * File: registrationService.js
 * Description: Service layer for making API calls related to registration.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const registrationService = {
  // Student submits semester course registration
  submitRegistration: async (data) => {
    const res = await api.post("/registrations", data);
    return res.data.registration;
  },

  // Student fetches their active registration (optionally for a specific semester)
  getMyRegistration: async (semester) => {
    const url = semester ? `/registrations/active?semester=${semester}` : "/registrations/active";
    const res = await api.get(url);
    return res.data.registration;
  },

  // Student fetches all their registrations across semesters
  getAllMyRegistrations: async () => {
    const res = await api.get("/registrations");
    return res.data.registrations || [];
  },

  // Faculty/Admin fetches all pending registrations awaiting review
  getPendingRegistrations: async () => {
    const res = await api.get("/registrations/pending");
    return res.data.registrations || [];
  },

  // Faculty/Admin approves registration with fee generation
  approveRegistration: async (id, approvalData) => {
    const res = await api.put(`/registrations/${id}/approve`, approvalData);
    return res.data.registration;
  },

  // Faculty/Admin rejects registration with comment
  rejectRegistration: async (id, rejectData) => {
    const res = await api.put(`/registrations/${id}/reject`, rejectData);
    return res.data.registration;
  },
};

export default registrationService;
