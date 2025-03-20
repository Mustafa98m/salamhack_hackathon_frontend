// api/reactQuery.js
import { QueryClient } from '@tanstack/react-query';
import axiosInstance from './axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create an auth API object
export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth', credentials);
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },
  // Add other auth-related API functions as needed
};

// Create a general API client object
export const apiClient = {
  get: async (url, config = {}) => {
    const response = await axiosInstance.get(url, config);
    return response.data;
  },
  post: async (url, data, config = {}) => {
    const response = await axiosInstance.post(url, data, config);
    return response.data;
  },

  patch: async (url, data, config = {}) => {
    const response = await axiosInstance.patch(url, data, config);
    return response.data;
  },
  // Add other methods as needed
};
