import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================================
GET MY WALLET
GET /wallet/me
=================================================
*/

export const getMyWallet = async () => {

    const response =
        await api.get(
            API_ENDPOINTS.GET_WALLET
        );

    return response.data;
};


/*
=================================================
ADD MONEY
POST /wallet/add-money
=================================================
*/

export const addMoney = async (amount) => {

    const response =
        await api.post(

            API_ENDPOINTS.ADD_MONEY,

            {
                amount,
            }

        );

    return response.data;
};


/*
=================================================
WITHDRAW MONEY
POST /wallet/withdraw
=================================================
*/

export const withdrawMoney = async (amount) => {

    const response =
        await api.post(

            API_ENDPOINTS.WITHDRAW,

            {
                amount,
            }

        );

    return response.data;
};


/*
=================================================
GET TRANSACTIONS
Legacy compatibility wrapper

Used by existing WalletPage components.
=================================================
*/

export const getTransactions = async (
    page = 0,
    size = 100
) => {

    const response =
        await api.get(
            API_ENDPOINTS.TRANSACTION_HISTORY,
            {
                params: {
                    page,
                    size,
                },
            }
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
=================================================
WALLET SUMMARY
GET /wallet/summary
=================================================
*/

export const getWalletSummary = async () => {

    const response =
        await api.get(
            API_ENDPOINTS.WALLET_SUMMARY
        );

    return response.data;
};