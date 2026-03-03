import { webmonClient } from '@/lib/api/webmonClient';

export interface Threat {
  id: number;
  site_id: string;
  crawl_page_id?: number;
  page_url: string;
  page_title?: string;
  matched_keywords: string; // comma-separated string
  threat_score: number;
  category: string;
  snippet?: string;         // 200-char context snippet dari halaman
  status: string; // pending / confirmed / false_positive / resolved
  detected_at: string;
  confirmed_at?: string;
  confirmed_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  notes?: string;
  site_name?: string;
  site_url?: string;
}

export interface ThreatStats {
  total: number;
  pending: number;
  confirmed: number;
  false_positive: number;
  resolved: number;
  by_category: { category: string; count: number }[];
  top_sites: { site_id: string; site_name: string; count: number }[];
}

export interface ThreatFilter {
  status?: string;
  site_id?: string;
  category?: string;
  min_score?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedThreats {
  success: boolean;
  message: string;
  data: Threat[];
  meta: { total: number; page: number; limit: number; total_pages: number };
}

async function listThreats(filter: ThreatFilter = {}): Promise<PaginatedThreats> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.site_id) params.set('site_id', filter.site_id);
  if (filter.category) params.set('category', filter.category);
  if (filter.min_score) params.set('min_score', String(filter.min_score));
  if (filter.page) params.set('page', String(filter.page));
  if (filter.limit) params.set('limit', String(filter.limit));
  const res = await webmonClient.get(`/api/v1/threats?${params}`);
  return res.data;
}

async function getThreat(id: number): Promise<Threat> {
  const res = await webmonClient.get(`/api/v1/threats/${id}`);
  return res.data.data;
}

async function updateStatus(id: number, status: string, notes?: string): Promise<Threat> {
  const res = await webmonClient.put(`/api/v1/threats/${id}/status`, { status, notes });
  return res.data.data;
}

async function getStats(): Promise<ThreatStats> {
  const res = await webmonClient.get('/api/v1/threats/stats');
  return res.data.data;
}

export const threatService = { listThreats, getThreat, updateStatus, getStats };
