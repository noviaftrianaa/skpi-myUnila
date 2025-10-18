/**
 * API Client with Axios
 *
 * Features:
 * - JWT token management (access + refresh)
 * - Auto token refresh on 401
 * - Request/Response interceptors
 * - Error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// TEMPORARY FIX: Force localhost URL untuk development
const getApiUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  // If running in browser and env has kong-gateway, replace with localhost
  if (typeof window !== 'undefined' && envUrl?.includes('kong-gateway')) {
    const fixedUrl = envUrl.replace('kong-gateway', 'localhost');
    return fixedUrl;
  }

  return envUrl || 'http://localhost:9800/auth-service/api/v1';
};

const API_URL = getApiUrl();
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

/**
 * Token Storage Keys
 */
export const TOKEN_KEYS = {
  ACCESS: 'auth_access_token',
  REFRESH: 'auth_refresh_token',
  USER: 'auth_user',
} as const;

/**
 * Get token from storage (client-side only)
 */
export const getToken = (key: keyof typeof TOKEN_KEYS): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS[key]);
};

/**
 * Set token to storage (client-side only)
 */
export const setToken = (key: keyof typeof TOKEN_KEYS, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS[key], value);
};

/**
 * Remove token from storage (client-side only)
 */
export const removeToken = (key: keyof typeof TOKEN_KEYS): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS[key]);
};

/**
 * Clear all auth tokens
 */
export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key));
};

/**
 * Create Axios Instance
 */
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    withCredentials: true, // Important: Send cookies with requests
  });

  /**
   * Request Interceptor
   * - Add JWT token to Authorization header
   */
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getToken('ACCESS');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response Interceptor
   * - Handle token refresh on 401
   * - Handle errors
   */
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - Token Expired
      // Don't try to refresh token for login/refresh endpoints
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                            originalRequest.url?.includes('/auth/refresh');

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;

        try {
          // Call refresh token endpoint
          // Note: refresh_token is sent automatically via HTTP-only cookie
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
              withCredentials: true, // Send cookies
            }
          );

          if (response.data.success) {
            const { access_token } = response.data.data;

            // Update access token only (refresh token stays in cookie)
            setToken('ACCESS', access_token);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            return instance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          clearTokens();

          // Redirect to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login?session_expired=true';
          }

          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * API Client Instance
 */
export const apiClient = createApiClient();

/**
 * API Error Handler
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
      code: axiosError.response?.data?.code || axiosError.code,
      status: axiosError.response?.status,
      errors: axiosError.response?.data?.errors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken('ACCESS');
};

export default apiClient;
