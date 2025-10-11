import axios from 'axios';
import { clearAuthCookies } from './api'; 

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];
let onTokenInvalidCallback = () => {};

export const setOnTokenInvalid = (callback) => {
    onTokenInvalidCallback = callback;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (originalRequest.url && (originalRequest.url.includes('logout/') || originalRequest.url.includes('refresh/'))) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // FIX: If this is the initial auth check, do not try to refresh or redirect.
      // Simply fail the request and let the calling function (in AuthContext) handle it.
      if (originalRequest._initialAuthCheck) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post('/users/refresh/', null);
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // This is a true session failure for an active user. Trigger the global handler.
        onTokenInvalidCallback();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;