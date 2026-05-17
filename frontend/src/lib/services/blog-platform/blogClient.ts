/**
 * Blog Platform API client (axios)
 *
 * Untuk komunikasi ke backend `blog-service` di port 8091.
 * Default ke localhost:8091/api/v1 untuk dev, override via NEXT_PUBLIC_BLOG_API_URL
 * untuk staging/production (lewat Kong: http://kong:9800/blog-service/api/v1).
 */
import axios from "axios";

const BLOG_API_URL =
  process.env.NEXT_PUBLIC_BLOG_API_URL || "http://localhost:8091/api/v1";

export const blogClient = axios.create({
  baseURL: BLOG_API_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token kalau ada (read-only endpoints tidak butuh, write endpoints akan)
if (typeof window !== "undefined") {
  blogClient.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("auth_access_token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
}

// Generic response envelope dari blog-service
export interface APIEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface APIList<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
