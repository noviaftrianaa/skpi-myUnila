/**
 * Endpoint (WS Endpoint) Service
 * Service untuk mengambil data endpoint dari Auth Service (ManAkses)
 */

import { authClient } from '@/lib/api/authClient';

// Types
export interface Endpoint {
  id_endpoint: string;
  id_aplikasi?: string;
  nm_endpoint: string;
  path_url: string;
  nm_group: string | null;
  nm_method: string | null;
  a_active: boolean;
  tgl_create: string | null;
  last_update: string | null;
}

export interface EndpointDetail extends Endpoint {}

export interface EndpointListResult {
  data: Endpoint[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface EndpointStats {
  total_endpoint: number;
  total_aktif: number;
  total_nonaktif: number;
  total_get: number;
  total_post: number;
  total_put: number;
  total_delete: number;
}

export interface EndpointListParams {
  page?: number;
  limit?: number;
  search?: string;
  nm_group?: string;
  nm_method?: string;
  a_active?: boolean;
  id_aplikasi?: string;
}

export interface EndpointCreateData {
  nm_endpoint: string;
  path_url: string;
  nm_group?: string | null;
  nm_method?: string | null;
  a_active?: boolean;
}

export interface EndpointUpdateData extends EndpointCreateData {}

// Group option type
export interface EndpointGroup {
  nm_group: string;
  total: number;
}

// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Endpoint Service for ManAkses
 * Manages WS endpoint data from auth-service
 */
export const endpointService = {
  /**
   * Get paginated list of endpoints with optional search and filters
   * Protected endpoint - requires JWT authentication
   */
  async getList(params?: EndpointListParams): Promise<EndpointListResult> {
    const response = await authClient.get<ApiResponse<EndpointListResult>>(
      '/manakses/endpoint',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get all endpoint groups for dropdown
   * Protected endpoint - requires JWT authentication
   */
  async getGroups(): Promise<EndpointGroup[]> {
    const response = await authClient.get<ApiResponse<EndpointGroup[]>>(
      '/manakses/endpoint/groups'
    );
    return response.data.data;
  },

  /**
   * Get endpoint statistics
   * Protected endpoint - requires JWT authentication
   */
  async getStats(): Promise<EndpointStats> {
    const response = await authClient.get<ApiResponse<EndpointStats>>(
      '/manakses/endpoint/stats'
    );
    return response.data.data;
  },

  /**
   * Get endpoint detail by ID
   * Protected endpoint - requires JWT authentication
   */
  async getDetail(id: string): Promise<EndpointDetail> {
    const response = await authClient.get<ApiResponse<EndpointDetail>>(
      `/manakses/endpoint/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new endpoint
   * Protected endpoint - requires JWT authentication
   */
  async create(data: EndpointCreateData): Promise<Endpoint> {
    const response = await authClient.post<ApiResponse<Endpoint>>(
      '/manakses/endpoint',
      data
    );
    return response.data.data;
  },

  /**
   * Update existing endpoint
   * Protected endpoint - requires JWT authentication
   */
  async update(id: string, data: EndpointUpdateData): Promise<Endpoint> {
    const response = await authClient.put<ApiResponse<Endpoint>>(
      `/manakses/endpoint/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete endpoint (soft delete)
   * Protected endpoint - requires JWT authentication
   */
  async delete(id: string): Promise<void> {
    await authClient.delete(`/manakses/endpoint/${id}`);
  },
};

export default endpointService;
