import axios, { AxiosError } from 'axios';
import { getAuthToken } from '@/utils/auth';
import { useAuthStore } from '@/store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Automatically set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as any;
    const message = data?.message || error.message || 'An unexpected error occurred';

    if (error.response?.status === 401) {
      console.error(`Unauthorized access at ${error.config?.url} - logging out`);
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
