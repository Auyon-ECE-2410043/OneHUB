/**
 * File: calendarService.js
 * Description: Service layer for making API calls related to calendar.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const calendarService = {
  getHolidays: async () => {
    const res = await api.get("/calendar/holidays");
    return res.data.holidays || [];
  },
  createHoliday: async (data) => {
    const res = await api.post("/calendar/holidays", data);
    return res.data;
  },
  updateHoliday: async (id, data) => {
    const res = await api.put(`/calendar/holidays/${id}`, data);
    return res.data;
  },
  deleteHoliday: async (id) => {
    const res = await api.delete(`/calendar/holidays/${id}`);
    return res.data;
  },
};
