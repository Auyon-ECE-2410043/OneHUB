/**
 * File: routineService.js
 * Description: Service layer for making API calls related to routine.
 * 
 * This file is part of the RUET OneHub Project.
 */

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

  getSyllabus: async (params) => {
    const res = await api.get("/routine/syllabus", { params });
    return res.data;
  },

  addSyllabus: async (data) => {
    const res = await api.post("/routine/syllabus", data);
    return res.data;
  },

  deleteSyllabus: async (id) => {
    const res = await api.delete(`/routine/syllabus/${id}`);
    return res.data;
  },
};

export default routineService;
