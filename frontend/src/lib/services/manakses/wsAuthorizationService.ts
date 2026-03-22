/**
 * WS Authorization Service
 * Manage endpoint access control per role
 */

import { authClient } from '@/lib/api/authClient';

export interface WsAuthEndpoint {
  id_ws_endpoint: string;
  id_aplikasi: string;
  nm_group: string;
  nm_method: string;
  path_url: string;
  nm_endpoint: string;
}

export interface WsAuthByRoleResult {
  data: WsAuthEndpoint[];
  endpoint_ids: string[];
  total: number;
}

export interface BulkResult {
  success: boolean;
  message: string;
  inserted?: number;
  skipped?: number;
  revoked?: number;
  assigned?: number;
  unchanged?: number;
}

export interface GenerateResult {
  success: boolean;
  message: string;
  inserted: number;
  updated: number;
  unchanged: number;
  total_processed: number;
}

export interface SystemRoute {
  method: string;
  path: string;
  nm_group: string;
}

export const wsAuthorizationService = {
  /**
   * Get authorized endpoint IDs for a role
   */
  async getByRole(idPeran: number, idAplikasi?: string): Promise<WsAuthByRoleResult> {
    const params: Record<string, string> = {};
    if (idAplikasi) params.id_aplikasi = idAplikasi;
    const response = await authClient.get(`/manakses/ws-authorization/by-role/${idPeran}`, { params });
    return response.data;
  },

  /**
   * Sync: set exact desired endpoint IDs for a role (auto assign/revoke diff)
   */
  async sync(idPeran: number, idAplikasi: string, endpointIds: string[]): Promise<BulkResult> {
    const response = await authClient.post('/manakses/ws-authorization/sync', {
      id_peran: idPeran,
      id_aplikasi: idAplikasi,
      endpoint_ids: endpointIds,
    });
    return response.data;
  },

  /**
   * Get authorized endpoint IDs for a pengguna (user)
   */
  async getByPengguna(idPengguna: string, idAplikasi?: string): Promise<WsAuthByRoleResult> {
    const params: Record<string, string> = {};
    if (idAplikasi) params.id_aplikasi = idAplikasi;
    const response = await authClient.get(`/manakses/ws-authorization/by-pengguna/${idPengguna}`, { params });
    return response.data;
  },

  /**
   * Sync: set exact desired endpoint IDs for a pengguna (auto assign/revoke diff)
   */
  async syncByPengguna(idPengguna: string, idAplikasi: string, endpointIds: string[]): Promise<BulkResult> {
    const response = await authClient.post('/manakses/ws-authorization/sync-by-pengguna', {
      id_pengguna: idPengguna,
      id_aplikasi: idAplikasi,
      endpoint_ids: endpointIds,
    });
    return response.data;
  },

  /**
   * Generate/upsert endpoints from external routes
   */
  async generateEndpoints(idAplikasi: string, endpoints: Array<{
    nm_group: string;
    nm_method: string;
    path_url: string;
    nm_endpoint: string;
  }>): Promise<GenerateResult> {
    const response = await authClient.post('/manakses/endpoint/generate', {
      id_aplikasi: idAplikasi,
      endpoints,
    });
    return response.data;
  },

  /**
   * Fetch routes from ws-service /system/routes
   */
  async fetchWsRoutes(): Promise<{ routes: SystemRoute[]; total: number }> {
    const WS_URL = process.env.NEXT_PUBLIC_WS_API_URL || 'http://localhost:9800/ws-service';
    const response = await fetch(`${WS_URL}/system/routes`);
    if (!response.ok) throw new Error('Failed to fetch ws-service routes');
    return response.json();
  },
};

export default wsAuthorizationService;
