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
    timeout: 90000,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ============================================================
   REFRESH TOKEN CLIENT

   Separate client prevents refresh requests from triggering
   the main Axios response interceptor.
============================================================ */

const refreshClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 90000,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ============================================================
   SHARED REFRESH PROMISE

   Startup restoration and 401 recovery share one request.
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
   TEMPORARY REFRESH ERROR DETECTION
============================================================ */

const isTemporaryRefreshError = (error) => {
    const status = error?.response?.status;

    // Network errors and timeouts are temporary.
    if (!error?.response) {
        return true;
    }

    // Server errors and rate limits may be temporary.
    return status >= 500 || status === 429;
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
   SHARED REFRESH SESSION REQUEST

   Both restoreSession() and the response interceptor use this
   function to avoid duplicate refresh requests.
============================================================ */

const requestRefreshSession = () => {
    if (refreshPromise) {
        return refreshPromise;
    }

    const refreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    if (!refreshToken) {
        return Promise.reject(
            new Error("Refresh token is unavailable.")
        );
    }

    refreshPromise = refreshClient
        .post(
            API_ENDPOINTS.REFRESH,
            { refreshToken }
        )
        .then((response) => {
            const data = response?.data;

            if (
                !data ||
                typeof data.accessToken !== "string" ||
                !data.accessToken
            ) {
                throw new Error(
                    "Refresh response did not contain an access token."
                );
            }

            // Store the new access token.
            localStorage.setItem(
                STORAGE_KEYS.ACCESS_TOKEN,
                data.accessToken
            );

            // Support refresh-token rotation.
            if (
                typeof data.refreshToken === "string" &&
                data.refreshToken
            ) {
                localStorage.setItem(
                    STORAGE_KEYS.REFRESH_TOKEN,
                    data.refreshToken
                );
            }

            return data;
        })
        .finally(() => {
            // Allow a future retry after success or failure.
            refreshPromise = null;
        });

    return refreshPromise;
};

/* ============================================================
   REFRESH ACCESS TOKEN

   Used by the response interceptor after a 401 response.
============================================================ */

const refreshAccessToken = async () => {
    const data = await requestRefreshSession();

    return data.accessToken;
};

/* ============================================================
   GET SHARED REFRESH ACCESS TOKEN
============================================================ */

const getRefreshAccessToken = async () => {
    return refreshAccessToken();
};

/* ============================================================
   RESTORE SESSION

   Used by AuthContext during application initialization.
============================================================ */

export const restoreSession = async () => {
    const refreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    if (!refreshToken) {
        return null;
    }

    const data = await requestRefreshSession();

    if (
        typeof data.email !== "string" ||
        !data.email.trim() ||
        typeof data.name !== "string" ||
        !data.name.trim() ||
        typeof data.role !== "string" ||
        !data.role.trim()
    ) {
        throw new Error(
            "Session restoration returned incomplete authentication data."
        );
    }

    const userData = {
        name: data.name.trim(),
        email: data.email.trim(),
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
        STORAGE_KEYS.EMAIL,
        userData.email
    );

    localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(userData)
    );

    return {
        ...data,
        ...userData,
    };
};

/* ============================================================
   LOGOUT SESSION

   Revokes the refresh token on the backend.
============================================================ */

export const logoutSession = async () => {
    const refreshToken = localStorage.getItem(
        STORAGE_KEYS.REFRESH_TOKEN
    );

    if (!refreshToken) {
        return;
    }

    await refreshClient.post(
        API_ENDPOINTS.LOGOUT,
        { refreshToken }
    );
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
         * Normalize errors that are not 401 responses.
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
         * A refresh endpoint 401 means the refresh token
         * was rejected. The separate refresh client normally
         * handles this path without this interceptor.
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
            /*
             * Do not destroy a session when Render is asleep,
             * starting, unavailable, or timing out.
             */

            if (isTemporaryRefreshError(refreshError)) {
                return Promise.reject(
                    normalizeApiError(refreshError)
                );
            }

            /*
             * A definitive refresh failure means the session
             * cannot be renewed.
             */

            redirectToLogin();

            return Promise.reject(
                refreshError instanceof ApiError
                    ? refreshError
                    : normalizeApiError(refreshError)
            );
        }
    }
);

export default axiosInstance;