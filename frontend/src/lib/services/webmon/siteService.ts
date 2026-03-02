import { webmonClient } from '@/lib/api/webmonClient';
import { AxiosError } from 'axios';

export interface Site {
  id: string;
  url: string;
  name: string;
  platform: string;
  platform_version?: string;
  blogger_blog_id?: string;
  sync_interval_min: number;
  last_synced_at?: string;
  status: string;         // active / inactive / compromised / maintenance
  is_active: number;
  fakultas_id?: string;
  unit_id?: string;
  admin_name?: string;
  admin_email?: string;
  admin_phone?: string;
  notes?: string;
  is_behind_kong: number;
  is_sso_enabled: number;
  last_check?: {
    checked_at: string;
    http_code: number;
    response_time_ms: number;
    is_up: number;
    ssl_expiry_days?: number;
  };
}

export interface SiteStats {
  total: number;
  active: number;
  inactive: number;
  compromised: number;
  maintenance: number;
  online_now: number;
  offline_now: number;
  by_platform: { platform: string; count: number }[];
  by_fakultas: { fakultas_id: string; count: number }[];
}

export interface SiteListFilter {
  status?: string;
  platform?: string;
  fakultas_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

async function listSites(filter: SiteListFilter = {}): Promise<PaginatedResponse<Site>> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.platform) params.set('platform', filter.platform);
  if (filter.fakultas_id) params.set('fakultas_id', filter.fakultas_id);
  if (filter.search) params.set('search', filter.search);
  if (filter.page) params.set('page', String(filter.page));
  if (filter.limit) params.set('limit', String(filter.limit));

  const res = await webmonClient.get(`/api/v1/sites?${params}`);
  return res.data;
}

async function getSite(id: string): Promise<Site> {
  const res = await webmonClient.get(`/api/v1/sites/${id}`);
  return res.data.data;
}

async function createSite(data: Partial<Site>): Promise<Site> {
  const res = await webmonClient.post('/api/v1/sites', data);
  return res.data.data;
}

async function updateSite(id: string, data: Partial<Site>): Promise<Site> {
  const res = await webmonClient.put(`/api/v1/sites/${id}`, data);
  return res.data.data;
}

async function deleteSite(id: string): Promise<void> {
  await webmonClient.delete(`/api/v1/sites/${id}`);
}

async function syncNow(id: string): Promise<unknown> {
  const res = await webmonClient.post(`/api/v1/sites/${id}/sync-now`);
  return res.data.data;
}

async function checkNow(id: string): Promise<unknown> {
  const res = await webmonClient.post(`/api/v1/sites/${id}/check-now`);
  return res.data.data;
}

async function getStats(): Promise<SiteStats> {
  const res = await webmonClient.get('/api/v1/sites/stats/overview');
  return res.data.data;
}

export function getApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return String(error);
}

export const siteService = { listSites, getSite, createSite, updateSite, deleteSite, syncNow, checkNow, getStats };
