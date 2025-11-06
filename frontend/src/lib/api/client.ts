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

// Auth API URL from environment variable (via Kong Gateway)
const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1';
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
                            originalRequest.url?.includes('/auth/refresh') ||
                            originalRequest.url?.includes('/auth/login-mfa');

      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;

        try {
          // Get refresh token from localStorage
          const refreshToken = getToken('REFRESH');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          console.log('🔄 Access token expired, refreshing with refresh_token...');

          // Call refresh token endpoint with refresh_token in body
          const response = await axios.post(
            `${API_URL}/auth/refresh`,
            {
              refresh_token: refreshToken,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data.success) {
            const { access_token, refresh_token: new_refresh_token } = response.data.data;

            // Update access token
            setToken('ACCESS', access_token);

            // Update refresh token if backend sent new one (token rotation)
            if (new_refresh_token) {
              setToken('REFRESH', new_refresh_token);
              console.log('✅ Tokens refreshed and rotated successfully');
            } else {
              console.log('✅ Access token refreshed successfully');
            }

            // Retry original request with new access token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            return instance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          console.error('❌ Token refresh failed:', refreshError);
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
