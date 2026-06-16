import axiosInstance from "../api/axiosConfig";

export const transferMoney = async (
  receiverEmail,
  amount
) => {

  const response =
    await axiosInstance.post(
      "/wallet/transfer",
      {
        receiverEmail,
        amount
      }
    );

  return response.data;
};