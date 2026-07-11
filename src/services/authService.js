import axiosInstance from "../api/axiosConfig";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/* ==========================
   LOGIN
========================== */

/**
 * Login User
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */

export const loginUser = async (email, password) => {

    const loginRequest = {
        email,
        password,
    };

    const response = await axiosInstance.post(

        API_ENDPOINTS.LOGIN,

        loginRequest

    );

    return response.data;

};

/* ==========================
   FORGOT PASSWORD
========================== */

/**
 * Send Password Reset Link
 * @param {string} email
 * @returns {Promise<Object>}
 */

export const forgotPassword = async (email) => {

    const forgotPasswordRequest = {
        email,
    };

    const response = await axiosInstance.post(

        API_ENDPOINTS.FORGOT_PASSWORD,

        forgotPasswordRequest

    );

    return response.data;

};

/* ==========================
   RESET PASSWORD
========================== */

/**
 * Reset Password
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<Object>}
 */

export const resetPassword = async (

    token,
    newPassword

) => {

    const resetPasswordRequest = {

        token,

        newPassword,

    };

    const response = await axiosInstance.post(

        API_ENDPOINTS.RESET_PASSWORD,

        resetPasswordRequest

    );

    return response.data;

};