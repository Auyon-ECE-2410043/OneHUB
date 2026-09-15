import api from "./api";

export const getDiningDashboard = async () => {
  const response = await api.get("/dining/dashboard");
  return response.data;
};

export const purchaseDiningToken = async (data) => {
  const response = await api.post("/dining/purchase", data);
  return response.data;
};

export const topupDiningWallet = async (amount) => {
  const response = await api.post("/dining/topup", { amount });
  return response.data;
};

