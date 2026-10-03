import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================================
TRANSFER MONEY
POST /transactions/send
=================================================
*/

export const transferMoney = async (
    receiverEmail,
    amount,
    category
) => {

    const response =
        await api.post(

            API_ENDPOINTS.TRANSFER,

            {
                receiverEmail,
                amount,
                category,
            }

        );

    return response.data;
};