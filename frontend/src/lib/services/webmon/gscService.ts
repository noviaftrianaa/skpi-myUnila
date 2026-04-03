import { webmonClient } from '@/lib/api/webmonClient';

export interface GSCQuota {
  daily_limit: number;
  used_today: number;
  remaining: number;
  reset_at: string;
  quota_exceeded: boolean;
}

export interface GSCRemovalLog {
  id: number;
  threat_id: number;
  url: string;
  action: string;          // URL_DELETED | URL_UPDATED
  gsc_request_id?: string;
  status: string;          // submitted | success | failed | rate_limited | skipped
  submitted_by?: string;
  submitted_at: string;
  error_message?: string;
}

export interface RemoveURLRequest {
  threat_id: number;
  url: string;
  action?: string;         // URL_DELETED (default) | URL_UPDATED
}

export interface ListLogsParams {
  threat_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}

async function getQuota(): Promise<GSCQuota> {
  const res = await webmonClient.get('/api/v1/gsc/quota');
  return res.data.data;
}

async function getLogs(params?: ListLogsParams): Promise<{ data: GSCRemovalLog[]; total: number }> {
  const res = await webmonClient.get('/api/v1/gsc/logs', { params });
  const d = res.data?.data || {};
  return {
    data: d.items || [],
    total: d.total || 0,
  };
}

async function removeURL(req: RemoveURLRequest): Promise<GSCRemovalLog> {
  const res = await webmonClient.post('/api/v1/gsc/remove', req);
  return res.data.data;
}

async function removeThreat(threatId: number): Promise<GSCRemovalLog> {
  const res = await webmonClient.post(`/api/v1/gsc/remove-threat/${threatId}`);
  return res.data.data;
}

export const gscService = { getQuota, getLogs, removeURL, removeThreat };
