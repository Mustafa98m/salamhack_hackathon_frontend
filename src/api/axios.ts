// api/axios.js
import axios from 'axios';

// Create an instance of axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4321',
  timeout: 300000, // Increased timeout to 10 seconds for better reliability
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken'); // Make sure this matches your AuthContext key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect for 401 errors that aren't auth-related requests
    if (error.response && error.response.status === 401) {
      // Don't redirect if this is already an auth-related request
      // This prevents redirect loops and problems during login/submission
      const isAuthRequest = error.config.url.includes('/auth');

      if (!isAuthRequest && !window.location.pathname.includes('/login')) {
        // Clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');

        // Redirect to login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
