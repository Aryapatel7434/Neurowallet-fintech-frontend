import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
export const getTransactionHistory =
async () => {

  const response =
    await api.get(
      API_ENDPOINTS.TRANSACTION_HISTORY
    );

  return response.data;
};

// export const getTransactionHistory = async () => {
//     const response = await axiosInstance.get("/transactions/history");
//     return response.data;
// };