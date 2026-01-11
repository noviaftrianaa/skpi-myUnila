/**
 * Auth API Client with Axios
 *
 * Features:
 * - JWT token management (access + refresh)
 * - Auto token refresh on 401
 * - Request/Response interceptors
 * - Error handling
 *
 * This client is used for Auth Service API calls (including ManAkses)
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, clearTokens } from './client';

// Auth API URL via Kong Gateway
// Note: Environment variable should include full path with /api/v1 suffix
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

/**
 * Create Auth API Client Instance
 */
const createAuthClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: AUTH_API_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
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
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - Token Expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get refresh token from localStorage
          const refreshToken = getToken('REFRESH');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Call refresh token endpoint
          // Note: NEXT_PUBLIC_AUTH_API_URL includes /api/v1, so just append /auth/refresh
          const AUTH_REFRESH_URL = `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1'}/auth/refresh`;

          const response = await axios.post(
            AUTH_REFRESH_URL,
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
 * Auth API Client Instance
 */
export const authClient = createAuthClient();

export default authClient;
