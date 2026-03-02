import { webmonClient as webmonPublicClient } from '@/lib/api/webmonClient';

export interface MonitoringStatus {
  status: string;         // aman / waspada / bahaya
  last_scan?: string;
  sites_monitored: number;
  active_threats: number;
  sites_online: number;
  sites_offline: number;
  updated_at: string;
}

export interface MonitoringStats {
  total_sites: number;
  active_sites: number;
  total_keywords: number;
  total_threats: number;
  active_threats: number;
  resolved_threats: number;
  threats_by_category: { category: string; count: number }[];
}

export interface DailySummary {
  id: number;
  summary_date: string;
  total_sites_monitored: number;
  sites_online: number;
  sites_offline: number;
  sites_compromised: number;
  new_threats_count: number;
  resolved_threats_count: number;
  active_threats_count: number;
  overall_status: string;
  top_threat_categories?: string;
}

async function getStatus(): Promise<MonitoringStatus> {
  const res = await webmonPublicClient.get('/v1/public/status');
  return res.data.data;
}

async function getStats(): Promise<MonitoringStats> {
  const res = await webmonPublicClient.get('/v1/public/stats');
  return res.data.data;
}

async function getDailySummary(days = 30): Promise<DailySummary[]> {
  const res = await webmonPublicClient.get(`/v1/public/daily-summary?days=${days}`);
  return res.data.data || [];
}

export const publicService = { getStatus, getStats, getDailySummary };
