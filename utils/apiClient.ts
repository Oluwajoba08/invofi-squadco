import { getAuthToken } from './auth';

interface FetchOptions extends RequestInit {
  data?: any;
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  { data, params, ...customConfig }: FetchOptions = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const token = getAuthToken();

  const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
  
  // 1. Initialize headers as a Record to allow string indexing
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // 2. Handle manual header overrides from customConfig
  if (customConfig.headers) {
    const overrideHeaders = customConfig.headers as Record<string, string>;
    Object.assign(headers, overrideHeaders);
  }

  // 3. Logic for Content-Type
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method: customConfig.method || (data ? 'POST' : 'GET'),
    ...customConfig,
    headers, // TypeScript now accepts this as it satisfies HeadersInit
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}${queryString}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API Error');
    }

    return response.status === 204 ? ({} as T) : await response.json();
  } catch (error) {
    console.error(`[API Error ${endpoint}]:`, error);
    throw error;
  }
}