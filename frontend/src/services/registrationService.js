import api from "./api";

export const registrationService = {
  // Student submits semester course registration
  submitRegistration: async (data) => {
    const res = await api.post("/registrations", data);
    return res.data.registration;
  },

  // Student fetches their active registration
  getMyRegistration: async () => {
    const res = await api.get("/registrations/active");
    return res.data.registration;
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
