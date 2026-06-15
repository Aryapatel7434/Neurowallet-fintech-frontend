import axiosInstance from "../api/axiosConfig";

export const loginUser = async (email, password) => {
  const response = await axiosInstance.post(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
};