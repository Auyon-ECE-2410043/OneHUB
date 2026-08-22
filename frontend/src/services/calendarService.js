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
};
