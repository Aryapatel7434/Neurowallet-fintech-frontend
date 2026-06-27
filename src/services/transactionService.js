import api from "../api/axiosConfig";

export const getTransactionHistory =
async () => {

  const response =
    await api.get(
      "/transactions/history"
    );

  return response.data;
};

// export const getTransactionHistory = async () => {
//     const response = await axiosInstance.get("/transactions/history");
//     return response.data;
// };