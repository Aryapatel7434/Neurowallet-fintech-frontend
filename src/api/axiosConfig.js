
import axios from "axios";

import { STORAGE_KEYS } from "../constants/storageKeys";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { ApiError } from "./apiError";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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

   Separate client prevents startup restoration from triggering
   the main client's automatic redirect interceptor.
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
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.USER);
};

/* ============================================================
   REDIRECT TO LOGIN
============================================================ */

const redirectToLogin = () => {
    clearAuthentication();

    if (window.location.pathname !== "/") {
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

    const status = error.response.status;
    const responseData = error.response.data;

    let message = responseData?.message;

    if (!message && typeof responseData === "string") {
        message = responseData;
    }

    if (!message) {
        switch (status) {
            case 400:
                message = "Invalid request.";
                break;

            case 401:
                message = "Authentication required.";
                break;

            case 403:
                message =
                    "You are not authorized to perform this action.";
                break;

            case 404:
                message = "The requested resource was not found.";
                break;

            case 409:
                message =
                    "The request conflicts with the current state.";
                break;

            case 422:
                message = "The submitted data is invalid.";
                break;

            case 429:
                message =
                    "Too many requests. Please try again later.";
                break;

            case 500:
                message = "An internal server error occurred.";
                break;

            case 502:
            case 503:
            case 504:
                message =
                    "The service is temporarily unavailable.";
                break;

            default:
                message = "Something went wrong. Please try again.";
        }
    }

    return new ApiError({
        message,
        status,
        code: responseData?.code || `HTTP_${status}`,
        data: responseData?.data ?? responseData,
        isNetworkError: false,
        originalError: error,
    });
};

/* ============================================================
   REFRESH ACCESS TOKEN
   Used by the response interceptor after a 401 response.
============================================================ */

const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    if (!refreshToken) {
        throw new Error("Refresh token is unavailable.");
    }

    const response = await refreshClient.post(
        API_ENDPOINTS.REFRESH,
        { refreshToken }
    );

    const accessToken = response?.data?.accessToken;

    if (
        typeof accessToken !== "string" ||
        !accessToken
    ) {
        throw new Error(
            "Refresh response did not contain an access token."
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.ACCESS_TOKEN,
        accessToken
    );

    /*
     * Support refresh-token rotation when provided by the backend.
     */
    if (
        typeof response?.data?.refreshToken === "string" &&
        response.data.refreshToken
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

    refreshPromise = refreshAccessToken();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
};

/* ============================================================
   RESTORE SESSION
   Used by AuthContext during application initialization.
   Returns authentication data after backend validation.
============================================================ */

export const restoreSession = async () => {
    const refreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    if (!refreshToken) {
        return null;
    }

    const response = await refreshClient.post(
        API_ENDPOINTS.REFRESH,
        { refreshToken }
    );

    const data = response?.data;

    if (
        !data ||
        typeof data.accessToken !== "string" ||
        !data.accessToken ||
        typeof data.email !== "string" ||
        !data.email ||
        typeof data.name !== "string" ||
        !data.name ||
        typeof data.role !== "string" ||
        !data.role.trim()
    ) {
        throw new Error(
            "Session restoration returned incomplete authentication data."
        );
    }

    const userData = {
        name: data.name,
        email: data.email,
        initials: data.name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join(""),
        role: data.role.trim(),
    };

    localStorage.setItem(
        STORAGE_KEYS.ACCESS_TOKEN,
        data.accessToken
    );

    if (
        typeof data.refreshToken === "string" &&
        data.refreshToken
    ) {
        localStorage.setItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            data.refreshToken
        );
    }

    localStorage.setItem(
        STORAGE_KEYS.EMAIL,
        userData.email
    );

    localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(userData)
    );

    return {
        ...data,
        role: userData.role,
    };
};


/* ============================================================
   REQUEST INTERCEPTOR
============================================================ */

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(
            STORAGE_KEYS.ACCESS_TOKEN
        );

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(normalizeApiError(error))
);

/* ============================================================
   RESPONSE INTERCEPTOR
============================================================ */

axiosInstance.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;

        /*
         * Normalize non-401 errors centrally.
         */
        if (!originalRequest || status !== 401) {
            return Promise.reject(normalizeApiError(error));
        }

        const requestUrl = originalRequest.url || "";

        /*
         * Login failures must not trigger token refresh.
         */
        if (requestUrl.includes(API_ENDPOINTS.LOGIN)) {
            return Promise.reject(normalizeApiError(error));
        }

        /*
         * A failed refresh request means the existing
         * authentication can no longer be refreshed.
         */
        if (requestUrl.includes(API_ENDPOINTS.REFRESH)) {
            redirectToLogin();
            return Promise.reject(normalizeApiError(error));
        }

        /*
         * Prevent infinite retry loops.
         */
        if (originalRequest._retry) {
            redirectToLogin();
            return Promise.reject(normalizeApiError(error));
        }

        originalRequest._retry = true;

        try {
            const newAccessToken =
                await getRefreshAccessToken();

            originalRequest.headers =
                originalRequest.headers || {};

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return axiosInstance(originalRequest);
        } catch (refreshError) {
            redirectToLogin();

            return Promise.reject(
                refreshError instanceof ApiError
                    ? refreshError
                    : new ApiError({
                        message:
                            "Your session has expired. Please log in again.",
                        status: 401,
                        code: "SESSION_EXPIRED",
                        data: null,
                        isNetworkError: false,
                        originalError: refreshError,
                    })
            );
        }
    }
);

export default axiosInstance;
