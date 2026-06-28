import axios from "axios";

const API =
  "http://localhost:8080/api/dashboard";

export const getDashboardInsights = async () => {

 const token = localStorage.getItem("accessToken");

  const response = await axios.get(
    `${API}/insights`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;

};