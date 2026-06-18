import axiosInstance from "../api/axiosConfig";

export const getMyWallet = async () => {

  const response =
    await axiosInstance.get(
      "/wallet/me"
    );

  return response.data;
};

export const addMoney = async (
  amount
) => {

  const response =
    await axiosInstance.post(
      "/wallet/add-money",
      {
        amount
      }
    );

  return response.data;
};

export const withdrawMoney =
  async (amount) => {

    const response =
      await axiosInstance.post(
        "/wallet/withdraw",
        {
          amount
        }
      );

    return response.data;
};
export const getTransactions =
  async () => {

    const response =
      await axiosInstance.get(
        "/wallet/transactions"
      );

    return response.data;
};
export const getNotifications =
  async () => {

    const response =
      await axiosInstance.get(
        "/notifications"
      );

    return response.data;
};