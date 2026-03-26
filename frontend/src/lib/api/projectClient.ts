/**
 * Project Service API Client
 *
 * Features:
 * - JWT token management (access + refresh)
 * - Auto token refresh on 401
 * - Request/Response interceptors
 * - Error handling
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, clearTokens } from './client';

// Project Service API URL — env tanpa /api/v1 (konsisten dengan service lain)
const PROJECT_API_URL = process.env.NEXT_PUBLIC_PROJECT_API_URL
  ? `${process.env.NEXT_PUBLIC_PROJECT_API_URL}/api/v1`
  : 'http://localhost:8090/api/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

/**
 * Create Project API Client Instance
 */
const createProjectClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: PROJECT_API_URL,
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
          const refreshToken = getToken('REFRESH');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1';
          const response = await axios.post(
            `${AUTH_API_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (response.data.success) {
            const { access_token, refresh_token: new_refresh_token } = response.data.data;

            setToken('ACCESS', access_token);

            if (new_refresh_token) {
              setToken('REFRESH', new_refresh_token);
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            return instance(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          clearTokens();

          if (typeof window !== 'undefined') {
            window.location.href = '/login?session_expired=true';
          }

          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Project API Client Instance
 */
export const projectClient = createProjectClient();

export default projectClient;
