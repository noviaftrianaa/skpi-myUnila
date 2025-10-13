/**
 * Common Types
 * Global types yang digunakan di seluruh aplikasi
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  perPage: number;
  totalItems: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}
