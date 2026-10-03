import api from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/*
=================================================
LOGIN
POST /auth/login
=================================================
*/

export const loginUser = async (
    email,
    password
) => {

    const response =
        await api.post(
            API_ENDPOINTS.LOGIN,
            {
                email,
                password,
            }
        );

    return response.data;
};


/*
=================================================
FORGOT PASSWORD
POST /auth/forgot-password
=================================================
*/

export const forgotPassword = async (
    email
) => {

    const response =
        await api.post(

            API_ENDPOINTS.FORGOT_PASSWORD,

            {
                email,
            }

        );

    return response.data;
};


/*
=================================================
RESET PASSWORD
POST /auth/reset-password
=================================================
*/

export const resetPassword = async (
    token,
    newPassword
) => {

    const response =
        await api.post(

            API_ENDPOINTS.RESET_PASSWORD,

            {
                token,
                newPassword,
            }

        );

    return response.data;
};