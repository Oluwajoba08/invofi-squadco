import { AxiosRequestConfig } from 'axios';
import axiosInstance from './axios';

export async function apiClient<T>(
  endpoint: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient<T>(url, { ...config, method: 'GET' }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient<T>(url, { ...config, method: 'POST', data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient<T>(url, { ...config, method: 'PUT', data }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient<T>(url, { ...config, method: 'PATCH', data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient<T>(url, { ...config, method: 'DELETE' }),
};
