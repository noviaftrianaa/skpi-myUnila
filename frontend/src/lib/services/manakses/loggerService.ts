/**
 * Logger Service
 * Service untuk mengambil data logger dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types for Login Logs
export interface LoginLog {
  id_log_login: string;
  id_aplikasi: string;
  id_pengguna: string;
  waktu_login: string;
  waktu_logout: string | null;
  ip_address: string;
  browser: string | null;
  os: string | null;
  a_sesi_aktif: boolean;
  username: string;
  nm_pengguna: string;
  email: string | null;
  nm_aplikasi: string;
  app_key: string;
  durasi_menit: number | null;
  status_sesi: string;
}

export interface LoginLogDetail extends LoginLog {
  jenis_kelamin: string | null;
  no_hp: string | null;
  jabatan: string | null;
  aplikasi_url: string | null;
  durasi_detik: number | null;
}

export interface LoginLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  id_aplikasi?: string;
  id_pengguna?: string;
  a_sesi_aktif?: 'true' | 'false';
  sort_by?: 'waktu_login' | 'waktu_logout' | 'username' | 'nm_pengguna' | 'nm_aplikasi' | 'ip_address';
  sort_order?: 'asc' | 'desc';
}

export interface LoginLogListResult {
  data: LoginLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Types for JWT Logs
export interface JwtLog {
  id_log_jwt: string;
  id_pengguna: string;
  id_aplikasi: string;
  token_value: string;
  url: string | null;
  ip_address: string;
  waktu_create: string;
  waktu_expired: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  nm_aplikasi: string;
  app_key: string;
  is_expired: boolean;
  status: string;
}

export interface AccessLog {
  id_log_akses_jwt: string;
  menu_akses: string;
  method: string;
  waktu_akses: string;
  a_berhasil: boolean;
  ket: string | null;
}

export interface JwtLogDetail extends JwtLog {
  jenis_kelamin: string | null;
  no_hp: string | null;
  jabatan: string | null;
  aplikasi_url: string | null;
  valid_durasi_menit: number | null;
  access_logs: AccessLog[];
}

export interface JwtLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  id_aplikasi?: string;
  id_pengguna?: string;
  sort_by?: 'waktu_create' | 'waktu_expired' | 'username' | 'nm_pengguna' | 'nm_aplikasi';
  sort_order?: 'asc' | 'desc';
}

export interface JwtLogListResult {
  data: JwtLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Types for JWT Access Logs
export interface JwtAccessLog {
  id_log_akses_jwt: string;
  id_log_jwt: string;
  menu_akses: string;
  method: string;
  request_list: string | null;
  waktu_akses: string;
  a_berhasil: boolean;
  ket: string | null;
  hasil_akses: string | null;
  id_pengguna: string;
  id_aplikasi: string;
  ip_address: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  nm_aplikasi: string;
  app_key: string;
  status: string;
}

export interface JwtAccessLogDetail extends JwtAccessLog {
  token_value: string;
  url: string | null;
  jwt_waktu_create: string;
  jwt_waktu_expired: string;
  jenis_kelamin: string | null;
  no_hp: string | null;
  jabatan: string | null;
  aplikasi_url: string | null;
}

export interface JwtAccessLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  id_log_jwt?: string;
  a_berhasil?: 'true' | 'false';
  method?: string;
  sort_by?: 'waktu_akses' | 'menu_akses' | 'method' | 'username' | 'nm_pengguna';
  sort_order?: 'asc' | 'desc';
}

export interface JwtAccessLogListResult {
  data: JwtAccessLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Logger Statistics
export interface LoggerStats {
  login: {
    total_logins: number;
    unique_users: number;
    unique_apps: number;
    active_sessions: number;
    logins_last_7days: number;
    logins_last_30days: number;
  };
  jwt: {
    total_jwt_logs: number;
    unique_users: number;
    valid_tokens: number;
    expired_tokens: number;
    tokens_last_7days: number;
  };
  access: {
    total_access_logs: number;
    successful_access: number;
    failed_access: number;
    access_last_7days: number;
    access_last_24hours: number;
  };
}

export interface MostActiveUser {
  id_pengguna: string;
  username: string;
  nm_pengguna: string;
  email: string | null;
  login_count: number;
  access_count: number;
  last_login: string | null;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Logger Service for ManAkses
 * Manages logger data from auth-service
 */
export const loggerService = {
  // ==================== Statistics ====================

  /**
   * Get logger statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<LoggerStats> {
    const response = await authClient.get<ApiResponse<LoggerStats>>(
      '/manakses/logger/stats'
    );
    return response.data.data;
  },

  /**
   * Get most active users
   * Protected endpoint - requires JWT authentication
   */
  async getMostActiveUsers(limit: number = 10): Promise<MostActiveUser[]> {
    const response = await authClient.get<ApiResponse<MostActiveUser[]>>(
      '/manakses/logger/most-active-users',
      { params: { limit } }
    );
    return response.data.data;
  },

  // ==================== Login Logs ====================

  /**
   * Get paginated list of login logs with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getLoginLogs(params?: LoginLogListParams): Promise<LoginLogListResult> {
    const response = await authClient.get<ApiResponse<LoginLogListResult>>(
      '/manakses/logger/login',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get login log detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getLoginLogDetail(id: string): Promise<LoginLogDetail> {
    const response = await authClient.get<ApiResponse<LoginLogDetail>>(
      `/manakses/logger/login/${id}`
    );
    return response.data.data;
  },

  // ==================== JWT Logs ====================

  /**
   * Get paginated list of JWT logs with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getJwtLogs(params?: JwtLogListParams): Promise<JwtLogListResult> {
    const response = await authClient.get<ApiResponse<JwtLogListResult>>(
      '/manakses/logger/jwt',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get JWT log detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getJwtLogDetail(id: string): Promise<JwtLogDetail> {
    const response = await authClient.get<ApiResponse<JwtLogDetail>>(
      `/manakses/logger/jwt/${id}`
    );
    return response.data.data;
  },

  // ==================== JWT Access Logs ====================

  /**
   * Get paginated list of JWT access logs with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getJwtAccessLogs(params?: JwtAccessLogListParams): Promise<JwtAccessLogListResult> {
    const response = await authClient.get<ApiResponse<JwtAccessLogListResult>>(
      '/manakses/logger/jwt-access',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get JWT access log detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getJwtAccessLogDetail(id: string): Promise<JwtAccessLogDetail> {
    const response = await authClient.get<ApiResponse<JwtAccessLogDetail>>(
      `/manakses/logger/jwt-access/${id}`
    );
    return response.data.data;
  },

};

export default loggerService;
