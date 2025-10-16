/**
 * Common Types
 * 
 * Shared types used across multiple modules
 */

export interface User {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  role: UserRole;
  foto?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'mahasiswa' | 'dosen' | 'staff' | 'admin';

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
