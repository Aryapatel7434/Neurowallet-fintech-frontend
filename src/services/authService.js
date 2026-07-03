import axiosInstance from "../api/axiosConfig";

/* ==========================
   LOGIN
========================== */

export const loginUser = async (email, password) => {

    const response = await axiosInstance.post(

        "/auth/login",

        {
            email,
            password
        }

    );

    return response.data;

};

/* ==========================
   FORGOT PASSWORD
========================== */

export const forgotPassword = async (email) => {

    const response = await axiosInstance.post(

        "/auth/forgot-password",

        {
            email
        }

    );

    return response.data;

};

/* ==========================
   RESET PASSWORD
========================== */

export const resetPassword = async (

    token,
    newPassword

) => {

    const response = await axiosInstance.post(

        "/auth/reset-password",

        {
            token,
            newPassword
        }

    );

    return response.data;

};