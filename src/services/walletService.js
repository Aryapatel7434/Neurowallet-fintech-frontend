import api from "../api/axiosConfig";

/*
=================================
GET MY WALLET
GET /wallet/me
=================================
*/

export const getMyWallet = async () => {

  const response =
    await api.get("/wallet/me");

  return response.data;
};

/*
=================================
ADD MONEY
POST /wallet/add
=================================
*/
export const addMoney = async (
  amount
) => {

  const response =
    await api.post(
      "/wallet/add-money",
      {
        amount
      }
    );

  return response.data;
};

/*
=================================
WITHDRAW MONEY
POST /wallet/withdraw
=================================
*/

export const withdrawMoney =
async (amount) => {

  const response =
    await api.post(
      "/wallet/withdraw",
      {
        amount
      }
    );

  return response.data;
};

/*
=================================
TRANSACTION HISTORY
GET /transactions/history
=================================
*/

export const getTransactions = async () => {

  const response =
     await api.get(
  "/wallet/transactions"
);
  console.log(
    "Transaction API Response:",
    response.data
  );

  if (
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  if (
    response.data &&
    Array.isArray(
      response.data.content
    )
  ) {
    return response.data.content;
  }

  if (
    response.data &&
    Array.isArray(
      response.data.transactions
    )
  ) {
    return response.data.transactions;
  }

  return [];
};