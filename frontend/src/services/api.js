/**
 * File: api.js
 * Description: React component rendering the api.js UI interface.
 * 
 * This file is part of the RUET OneHub Project.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor: attach JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Delete Content-Type for FormData so Axios sets the boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and extract backend error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect if we're attempting login
      if (!error.config.url.includes("/auth/login")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/" && window.location.pathname !== "/register") {
          window.location.href = "/";
        }
      }
    }
    
    // Extract standard error message from backend
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    
    return Promise.reject(new Error(message));
  }
);

export default api;

const cache = new Map();

const originalGet = api.get;
api.get = async (url, config = {}) => {
  const cacheKey = url + JSON.stringify(config.params || {});
  
  if (cache.has(cacheKey)) {
    // Background revalidate
    originalGet.call(api, url, config).then(res => {
       cache.set(cacheKey, res);
    }).catch(() => {});
    return Promise.resolve(cache.get(cacheKey));
  }

  const res = await originalGet.call(api, url, config);
  cache.set(cacheKey, res);
  return res;
};

const clearCache = () => cache.clear();
["post", "put", "delete", "patch"].forEach(method => {
  const original = api[method];
  api[method] = async (...args) => {
    clearCache();
    return original.apply(api, args);
  };
});
