import api from "./api";

export const calendarService = {
  getHolidays: async () => {
    const res = await api.get("/calendar/holidays");
    return res.data.holidays || [];
  },
};
