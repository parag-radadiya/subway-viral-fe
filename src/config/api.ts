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

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${ENV.API_BASE_URL}/api/auth/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.access_token || data.data.token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem("auth_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
