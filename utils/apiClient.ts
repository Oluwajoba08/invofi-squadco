import axiosInstance from '@/lib/axios';

interface FetchOptions {
  data?: any;
  params?: Record<string, any>;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: any;
}

export async function apiClient<T>(
  endpoint: string,
  { data, params, ...customConfig }: FetchOptions = {}
): Promise<T> {
  try {
    const response = await axiosInstance({
      url: endpoint,
      method: customConfig.method || (data ? 'POST' : 'GET'),
      data,
      params,
      ...customConfig,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}