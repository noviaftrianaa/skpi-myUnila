/**
 * Axios client untuk si-prestasi-service (via Kong).
 * Bearer JWT di-inject otomatis dari auth token localStorage.
 */
import axios, { type AxiosInstance } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_SI_PRESTASI_API_URL
  ? process.env.NEXT_PUBLIC_SI_PRESTASI_API_URL
  : "http://localhost:9800/si-prestasi-service/api";

export const simPrestasiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

simPrestasiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Konsisten dengan TOKEN_KEYS.ACCESS = "auth_access_token" di lib/api/client.ts.
    // Fallback "auth_token" / "token" untuk legacy session.
    const token =
      localStorage.getItem("auth_access_token") ||
      localStorage.getItem("auth_token") ||
      localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
