/**
 * Dashboard Pimpinan API Client with Axios
 *
 * Features:
 * - JWT token management (access + refresh)
 * - Auto token refresh on 401
 * - Request/Response interceptors
 *
 * This client is used for Dashboard Service API calls
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getToken, setToken, clearTokens } from './client';

// Dashboard API URL via Kong Gateway
const DASHBOARD_API_URL = process.env.NEXT_PUBLIC_DASHBOARD_API_URL
  ? `${process.env.NEXT_PUBLIC_DASHBOARD_API_URL}/api/v1`
  : 'http://localhost:9800/dashboard-service/api/v1';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000');

/**
 * Create Dashboard API Client Instance
 */
const createDashboardClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: DASHBOARD_API_URL,
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

      // ── Auto-inject role-based scope params (homebase filter) ─────────
      // Untuk Dekan (level 4) / Kaprodi (level 5), inject id_fakultas + id_prodi
      // ke query params kalau caller belum set manual. Dengan ini SEMUA page
      // dashboard/data-unila otomatis ter-scope tanpa edit per-page.
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('myunila_active_context');
          if (raw) {
            const ctx = JSON.parse(raw);
            const level = Number(ctx?.level_organisasi);
            const idOrg = ctx?.id_organisasi;
            const idInduk = ctx?.id_induk_organisasi;
            const namaPeran = String(ctx?.nm_peran || '').toLowerCase();

            // Skip kalau peran universal (admin/developer/helpdesk/dll)
            const isUniversal = !level || level <= 3
              || ['administrator', 'developer', 'helpdesk', 'service api'].some((k) => namaPeran.includes(k));

            // Kajur/Admin Jurusan tidak punya level_organisasi konsisten (kadang 4 sama dgn fakultas,
            // kadang NULL). Deteksi via nm_peran regex.
            const isJurusanRole = /admin\s*jurusan|kepala\s*jurusan|ketua\s*jurusan|kajur/i.test(namaPeran);

            if (!isUniversal && idOrg) {
              config.params = config.params || {};
              if (isJurusanRole) {
                // Kajur/Admin Jurusan → id_organisasi = jurusan UUID (pdrd.sms.id_jur_unila).
                // BE middleware RoleScopeFilter auto-derive id_fakultas dari pdrd.sms lookup,
                // tapi FE explicit inject id_jurusan agar Data Unila pages langsung respect.
                if (config.params.id_jurusan === undefined) config.params.id_jurusan = idOrg;
                if (config.params.id_fakultas === undefined && idInduk
                    && String(idInduk).toUpperCase() !== 'E2B705A7-173E-464A-9FAC-509128709515') {
                  config.params.id_fakultas = idInduk;
                }
              } else if (level === 4) {
                // Dekan → scope fakultas (id_organisasi-nya adalah fakultas)
                if (config.params.id_fakultas === undefined) config.params.id_fakultas = idOrg;
              } else if (level === 5) {
                // Kaprodi → scope prodi (parent fakultas via id_induk)
                if (config.params.id_prodi === undefined) config.params.id_prodi = idOrg;
                if (config.params.id_fakultas === undefined && idInduk) config.params.id_fakultas = idInduk;
              }
            }
          }
        }
      } catch {
        /* silent — fallback ke request tanpa scope */
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
   */
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = getToken('REFRESH');

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const AUTH_REFRESH_URL = `${process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:9800/auth-service/api/v1'}/auth/refresh`;

          const response = await axios.post(
            AUTH_REFRESH_URL,
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
 * Dashboard API Client Instance
 */
export const dashboardClient = createDashboardClient();

export default dashboardClient;
