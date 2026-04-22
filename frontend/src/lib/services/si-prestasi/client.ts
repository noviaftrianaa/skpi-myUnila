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
    const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
