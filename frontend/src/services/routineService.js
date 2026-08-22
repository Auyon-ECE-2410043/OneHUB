import api from "./api";

export const routineService = {
  getWeeklyRoutine: async () => {
    const res = await api.get("/routine/my-week");
    return res.data;
  },
  
  getTodayRoutine: async () => {
    const res = await api.get("/routine/today");
    return res.data;
  },

  getAllRoutine: async () => {
    const res = await api.get("/routine");
    return res.data;
  },

  addRoutineSlot: async (data) => {
    const res = await api.post("/routine", data);
    return res.data;
  },

  updateRoutineSlot: async (id, data) => {
    const res = await api.put(`/routine/${id}`, data);
    return res.data;
  },

  deleteRoutineSlot: async (id) => {
    const res = await api.delete(`/routine/${id}`);
    return res.data;
  },
};

export default routineService;
