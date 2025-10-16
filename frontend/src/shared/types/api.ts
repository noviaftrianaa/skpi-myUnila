/**
 * Generic API types
 *
 * Common types used across all API responses
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  version?: string;
}
