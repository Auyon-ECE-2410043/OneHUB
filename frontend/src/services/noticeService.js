import api from "./api";

export const noticeService = {
  // Get all notices
  getNotices: async () => {
    const res = await api.get("/notices");
    return res.data.notices || [];
  },

  // Create notice with optional file attachment
  createNotice: async (formData) => {
    const res = await api.post("/notices", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.notice;
  },

  // Delete notice
  deleteNotice: async (id) => {
    const res = await api.delete(`/notices/${id}`);
    return res.data;
  },
};

export default noticeService;
