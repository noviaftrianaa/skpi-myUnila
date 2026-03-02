/**
 * Web Monitoring Service API Client
 * Ikut pola sisterClient.ts
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, clearTokens } from './client';

const WEBMON_BASE = process.env.NEXT_PUBLIC_WEBMON_API_URL || 'http://localhost:9800/webmon-service';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000');

const createWebmonClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: WEBMON_BASE,
    timeout: API_TIMEOUT,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken('ACCESS');
    if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    (r) => r,
    async (error: AxiosError) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = getToken('REFRESH');
          if (!refreshToken) throw new Error('No refresh token');
          const AUTH_REFRESH = `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1'}/auth/refresh`;
          const res = await axios.post(AUTH_REFRESH, { refresh_token: refreshToken });
          if (res.data.success) {
            const { access_token, refresh_token: newRefresh } = res.data.data;
            setToken('ACCESS', access_token);
            if (newRefresh) setToken('REFRESH', newRefresh);
            if (original.headers) original.headers.Authorization = `Bearer ${access_token}`;
            return instance(original);
          }
          throw new Error('Token refresh failed');
        } catch {
          clearTokens();
          if (typeof window !== 'undefined') window.location.href = '/login?session_expired=true';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const webmonClient = createWebmonClient();

/** Public client — no auth header */
export const webmonPublicClient = axios.create({
  baseURL: WEBMON_BASE,
  timeout: API_TIMEOUT,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

export default webmonClient;
