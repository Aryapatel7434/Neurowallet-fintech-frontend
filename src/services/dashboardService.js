import axios from "axios";

const API_URL = "http://localhost:8080/api/dashboard";

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_URL}/stats`);
  return response.data;
};