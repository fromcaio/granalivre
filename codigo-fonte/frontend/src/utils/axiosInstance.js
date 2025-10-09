import axios from 'axios';
// FIX: Import clearAuthCookies from the core auth utilities file
import { clearAuthCookies } from './auth'; 

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true
});

let isRefreshing = false;
let failedQueue = [];

// This function will be set by AuthContext to notify of a fatal session end
let onTokenInvalidCallback = () => {
    console.warn("Session invalidated in axios interceptor, but no callback was set to handle the event (e.g., redirecting the user).");
};

/**
 * Public function to set the callback for when the refresh token fails.
 * This links the axios interceptor (low level) to the AuthContext (high level).
 */
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

    // 🚫 Do not attempt refresh if calling logout or refresh endpoints
    if (
      originalRequest.url &&
      (originalRequest.url.includes('logout/') || originalRequest.url.includes('refresh/'))
    ) {
      return Promise.reject(error);
    }

    // Check for 401 Unauthorized response and ensure we haven't already tried to retry this request
    if (error.response?.status === 401 && !originalRequest._retry) {

      // 1. If a refresh is already in progress, queue the current failed request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      // 2. Start the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to get a new access token using the refresh endpoint
        await axiosInstance.post('/users/refresh/', null);
        // If successful, process the queue and retry the original request
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // 3. If refresh fails (refresh token expired/invalid), process queue with error
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear cookies and notify high-level context of session invalidation
        clearAuthCookies();
        onTokenInvalidCallback(); // Crucial step for AuthContext synchronization

        // Reject the original request promise
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;