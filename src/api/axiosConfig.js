import axios from "axios";

const ACCESS_TOKEN_KEY = "accessToken";

const axiosInstance = axios.create({

  baseURL: process.env.REACT_APP_API_URL,

  timeout: 10000,

  headers: {
    "Content-Type": "application/json",
  },

});

/* ==========================
   Request Interceptor
========================== */

axiosInstance.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem(
        ACCESS_TOKEN_KEY
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;

  },

  (error) => Promise.reject(error)

);

/* ==========================
   Response Interceptor
========================== */

axiosInstance.interceptors.response.use(

  (response) => response,

  (error) => {

    /*
      Future Implementation

      401 → Refresh Token

      403 → Access Denied

      500 → Server Error

      Network Error

      Global Toast Notification
    */

    return Promise.reject(error);

  }

);
axiosInstance.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    if (error.response) {

      switch (error.response.status) {

        case 401:

          console.warn("Session expired.");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");

          window.location.href = "/login";

          break;

        case 403:

          console.warn("Access denied.");

          break;

        case 404:

          console.warn("Resource not found.");

          break;

        case 500:

          console.warn("Internal server error.");

          break;

        default:

          console.warn("Unexpected API error.");

      }

    } else {

      console.error("Network Error");

    }

    return Promise.reject(error);

  }

);
export default axiosInstance;