import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================
GET MY WALLET
GET /wallet/me
=================================
*/

export const getMyWallet = async () => {

  const response =
    await api.get(API_ENDPOINTS.GET_WALLET);

  return response.data;

};

/*
=================================
ADD MONEY
POST /wallet/add-money
=================================
*/

export const addMoney = async (amount) => {

  const response =
    await api.post(
      API_ENDPOINTS.ADD_MONEY,
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

export const withdrawMoney = async (amount) => {

  const response =
    await api.post(
      API_ENDPOINTS.WITHDRAW,
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
      "/transactions/history?page=0&size=100"
    );

  if (
    response.data &&
    Array.isArray(response.data.content)
  ) {
    return response.data.content;
  }

  return [];

};

/*
=================================
WALLET SUMMARY
GET /wallet/summary
=================================
*/

export const getWalletSummary = async () => {

  const response =
    await api.get("/wallet/summary");

  return response.data;

};