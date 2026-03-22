import axios from "axios";
import { ENV } from "../utils/constants";
import { ClientJS } from "clientjs";

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: ENV.API_BASE_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      const client = new ClientJS();
      config.headers["x-device-id"] = client.getFingerprint().toString();
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    // Extract message for err.message usage throughout the app
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    error.message = message;

    return Promise.reject(error);
  },
);

export default api;
