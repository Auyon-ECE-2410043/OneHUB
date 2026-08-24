/**
 * File: feeService.js
 * Description: Service layer for making API calls related to fee.
 * 
 * This file is part of the RUET OneHub Project.
 */

import api from "./api";

export const feeService = {
  // Get all fees for current student
  getMyFees: async () => {
    const res = await api.get("/fees");
    return res.data.fees || [];
  },

  // Pay fee via simulated gateway
  payFee: async (feeId, paymentMethod) => {
    const res = await api.post(`/fees/${feeId}/pay`, { paymentMethod });
    return res.data.fee;
  },

  // Get payment history (paid only)
  
  // Assign a custom fee (Admin only)
  assignFee: async (payload) => {
    const res = await api.post("/fees/assign", payload);
    return res.data;
  },
  getPaymentHistory: async () => {
    const res = await api.get("/fees/history");
    return res.data.fees || [];
  },
};

export default feeService;
