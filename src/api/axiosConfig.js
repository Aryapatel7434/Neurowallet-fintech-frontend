import axios from "axios";

console.log(
  "BASE URL =",
  process.env.REACT_APP_API_URL
);

const axiosInstance = axios.create({

  baseURL:
    process.env.REACT_APP_API_URL,

  timeout: 10000,

  headers: {
    "Content-Type":
      "application/json"
  }
});

axiosInstance.interceptors.request.use(

  (config) => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;