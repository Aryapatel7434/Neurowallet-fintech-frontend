import axios from "axios";

import { STORAGE_KEYS } from "../constants/storageKeys";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { ApiError } from "./apiError";

const API_BASE_URL =
    process.env.REACT_APP_API_URL;

/* ============================================================
   MAIN API CLIENT
============================================================ */

const axiosInstance = axios.create({

    baseURL: API_BASE_URL,

    timeout: 15000,

    headers: {
        "Content-Type": "application/json",
    },

});

/* ============================================================
   REFRESH TOKEN CLIENT
============================================================ */

const refreshClient = axios.create({

    baseURL: API_BASE_URL,

    timeout: 10000,

    headers: {
        "Content-Type": "application/json",
    },

});

/* ============================================================
   SHARED REFRESH PROMISE
============================================================ */

let refreshPromise = null;

/* ============================================================
   CLEAR AUTHENTICATION
============================================================ */

const clearAuthentication = () => {

    localStorage.removeItem(
        STORAGE_KEYS.ACCESS_TOKEN
    );

    localStorage.removeItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    localStorage.removeItem(
        STORAGE_KEYS.EMAIL
    );

    localStorage.removeItem(
        STORAGE_KEYS.USER
    );

};

/* ============================================================
   REDIRECT TO LOGIN
============================================================ */

const redirectToLogin = () => {

    clearAuthentication();

    if (
        window.location.pathname !== "/"
    ) {

        window.location.assign("/");

    }

};

/* ============================================================
   API ERROR NORMALIZATION
============================================================ */

const normalizeApiError = (error) => {

    /*
     * Network / timeout / unavailable backend
     */
    if (!error.response) {

        const isTimeout =
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT";

        return new ApiError({

            message: isTimeout
                ? "The request timed out. Please try again."
                : "Unable to connect to the server. Please check your connection.",

            status: null,

            code: error.code || "NETWORK_ERROR",

            data: null,

            isNetworkError: true,

            originalError: error,

        });

    }

    const status =
        error.response.status;

    const responseData =
        error.response.data;

    /*
     * Support standardized backend ApiResponse:
     *
     * {
     *   success,
     *   message,
     *   data,
     *   timestamp
     * }
     */

    let message =
        responseData?.message;

    /*
     * Support validation/error responses
     * that may contain a different structure.
     */

    if (
        !message &&
        typeof responseData === "string"
    ) {

        message =
            responseData;

    }

    if (!message) {

        switch (status) {

            case 400:
                message =
                    "Invalid request.";

                break;

            case 401:
                message =
                    "Authentication required.";

                break;

            case 403:
                message =
                    "You are not authorized to perform this action.";

                break;

            case 404:
                message =
                    "The requested resource was not found.";

                break;

            case 409:
                message =
                    "The request conflicts with the current state.";

                break;

            case 422:
                message =
                    "The submitted data is invalid.";

                break;

            case 429:
                message =
                    "Too many requests. Please try again later.";

                break;

            case 500:
                message =
                    "An internal server error occurred.";

                break;

            case 502:
            case 503:
            case 504:
                message =
                    "The service is temporarily unavailable.";

                break;

            default:
                message =
                    "Something went wrong. Please try again.";

        }

    }

    return new ApiError({

        message,

        status,

        code:
            responseData?.code ||
            `HTTP_${status}`,

        data:
            responseData?.data ??
            responseData,

        isNetworkError: false,

        originalError: error,

    });

};

/* ============================================================
   REFRESH ACCESS TOKEN
============================================================ */

const refreshAccessToken = async () => {

    const refreshToken =
        localStorage.getItem(
            STORAGE_KEYS.REFRESH_TOKEN
        );

    if (!refreshToken) {

        throw new Error(
            "Refresh token is unavailable."
        );

    }

    const response =
        await refreshClient.post(

            API_ENDPOINTS.REFRESH,

            {
                refreshToken,
            }

        );

    const accessToken =
        response?.data?.accessToken;

    if (!accessToken) {

        throw new Error(
            "Refresh response did not contain an access token."
        );

    }

    localStorage.setItem(

        STORAGE_KEYS.ACCESS_TOKEN,

        accessToken

    );

    /*
     * Supports refresh-token rotation.
     */
    if (
        response?.data?.refreshToken
    ) {

        localStorage.setItem(

            STORAGE_KEYS.REFRESH_TOKEN,

            response.data.refreshToken

        );

    }

    return accessToken;

};

/* ============================================================
   GET / CREATE SHARED REFRESH PROMISE
============================================================ */

const getRefreshAccessToken = async () => {

    if (refreshPromise) {

        return refreshPromise;

    }

    refreshPromise =
        refreshAccessToken();

    try {

        return await refreshPromise;

    } finally {

        refreshPromise = null;

    }

};

/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */

axiosInstance.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                STORAGE_KEYS.ACCESS_TOKEN
            );

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) =>
        Promise.reject(
            normalizeApiError(error)
        )

);

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */

axiosInstance.interceptors.response.use(

    (response) =>
        response,

    async (error) => {

        const originalRequest =
            error.config;

        const status =
            error.response?.status;

        /*
         * Non-401 errors:
         *
         * Normalize centrally.
         */
        if (
            !originalRequest ||
            status !== 401
        ) {

            return Promise.reject(
                normalizeApiError(error)
            );

        }

        const requestUrl =
            originalRequest.url || "";

        /*
         * Login must not trigger refresh.
         */
        if (
            requestUrl.includes(
                API_ENDPOINTS.LOGIN
            )
        ) {

            return Promise.reject(
                normalizeApiError(error)
            );

        }

        /*
         * Refresh failure means
         * authentication is no longer valid.
         */
        if (
            requestUrl.includes(
                API_ENDPOINTS.REFRESH
            )
        ) {

            redirectToLogin();

            return Promise.reject(
                normalizeApiError(error)
            );

        }

        /*
         * Prevent infinite retry loops.
         */
        if (
            originalRequest._retry
        ) {

            redirectToLogin();

            return Promise.reject(
                normalizeApiError(error)
            );

        }

        originalRequest._retry = true;

        try {

            const newAccessToken =
                await getRefreshAccessToken();

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return axiosInstance(
                originalRequest
            );

        } catch (refreshError) {

            redirectToLogin();

            return Promise.reject(

                refreshError instanceof ApiError
                    ? refreshError
                    : new ApiError({

                        message:
                            "Your session has expired. Please log in again.",

                        status: 401,

                        code:
                            "SESSION_EXPIRED",

                        data: null,

                        isNetworkError: false,

                        originalError:
                            refreshError,

                    })

            );

        }

    }

);

export default axiosInstance;