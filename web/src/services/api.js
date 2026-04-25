import axios from "axios";

// Unified server: frontend & backend run on same port → use relative path.
// Override with VITE_API_BASE_URL if running frontend separately (dev only).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const getCookie = (name) => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length !== 2) return null;
  return parts.pop().split(";").shift() || null;
};

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Crucial for HTTP-Only Cookies
  xsrfCookieName: "XSRF-TOKEN", // Grabs cookie set by backend
  xsrfHeaderName: "X-XSRF-TOKEN", // Sends it back in headers
  headers: {
    "Content-Type": "application/json",
  },
});

// Ensure CSRF header is sent even for cross-origin (different port) requests.
api.interceptors.request.use((config) => {
  const csrfToken = getCookie("XSRF-TOKEN");
  if (csrfToken) {
    config.headers = config.headers || {};
    if (!config.headers["X-XSRF-TOKEN"]) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
  }
  return config;
});

let isRefreshing = false;
const failedQueue = [];

const processQueue = (error) => {
  while (failedQueue.length) {
    const { resolve, reject } = failedQueue.shift();
    if (error) reject(error);
    else resolve();
  }
};

// ── Response Interceptor ────────────────────────────────────────────
// Strategy:
//   /auth/me 401       → attempt refresh once, then fallback to guest state
//   /auth/login 401    → reject normally (let Login.jsx handle UI)
//   /auth/refresh 401  → reject normally (session truly dead)
//   Any other 401      → attempt token refresh once → retry → redirect on failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || "";

    // ── CASE 1: Login or refresh-token fails — don't retry, let caller handle.
    if (
      status === 401 &&
      (url.includes("/auth/login") ||
        url.includes("/auth/admin/login") ||
        url.includes("/auth/refresh-token"))
    ) {
      return Promise.reject(error);
    }

    // ── CASE 2: Attempt refresh if /auth/me returns 401 and we have not retried yet.
    if (status === 401 && url.includes("/auth/me") && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post("/auth/refresh-token");
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.resolve({ data: { success: false, data: null } });
      }
    }

    // ── CASE 3: Silent refresh for other protected endpoint failures.
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const retryOriginalRequest = () => api(originalRequest);

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(retryOriginalRequest)
          .catch((refreshError) => Promise.reject(refreshError));
      }

      isRefreshing = true;
      return new Promise(async (resolve, reject) => {
        try {
          await api.post("/auth/refresh-token");
          processQueue();
          resolve(retryOriginalRequest());
        } catch (refreshError) {
          processQueue(refreshError);
          if (!window.location.pathname.includes("/login")) {
            console.warn("[AUTH] Session expired. Redirecting to login.");
            window.location.href = "/login";
          }
          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    return Promise.reject(error);
  },
);

export default api;
