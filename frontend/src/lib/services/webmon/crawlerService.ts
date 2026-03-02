import { webmonClient } from '@/lib/api/webmonClient';

export interface CrawlJob {
  id: number;
  site_id?: string;
  job_type: string;   // full / incremental / single
  status: string;     // queued / running / done / failed
  triggered_by: string;
  started_at?: string;
  finished_at?: string;
  error_msg?: string;
  notes?: string;
}

export interface CrawlSession {
  id: number;
  job_id: number;
  site_id: string;
  status: string;
  total_pages: number;
  threat_count: number;
  started_at?: string;
  finished_at?: string;
  error_msg?: string;
}

export interface CrawlStats {
  total_jobs: number;
  running_jobs: number;
  total_sessions: number;
  total_pages: number;
  total_threats: number;
}

async function listJobs(filter: { status?: string; site_id?: string; page?: number; limit?: number } = {}): Promise<{ data: CrawlJob[]; meta: { total: number } }> {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.site_id) params.set('site_id', filter.site_id);
  if (filter.page) params.set('page', String(filter.page));
  params.set('limit', String(filter.limit || 20));
  const res = await webmonClient.get(`/api/v1/crawl/jobs?${params}`);
  return res.data;
}

async function createJob(data: { site_id?: string; job_type: string; notes?: string }): Promise<CrawlJob> {
  const res = await webmonClient.post('/api/v1/crawl/jobs', data);
  return res.data.data;
}

async function getJob(id: number): Promise<CrawlJob> {
  const res = await webmonClient.get(`/api/v1/crawl/jobs/${id}`);
  return res.data.data;
}

async function listSessions(jobId: number): Promise<CrawlSession[]> {
  const res = await webmonClient.get(`/api/v1/crawl/jobs/${jobId}/sessions`);
  return res.data.data;
}

async function getStats(): Promise<CrawlStats> {
  const res = await webmonClient.get('/api/v1/crawl/stats');
  return res.data.data;
}

export const crawlerService = { listJobs, createJob, getJob, listSessions, getStats };
