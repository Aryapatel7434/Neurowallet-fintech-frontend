import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================================
REGISTER USER
POST /users/register
=================================================
*/

export const registerUser = async (
    userData
) => {

    const response =
        await api.post(

            API_ENDPOINTS.REGISTER,

            userData

        );

    return response.data;
};