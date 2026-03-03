import { webmonClient } from '@/lib/api/webmonClient';

export interface Keyword {
  id: number;
  keyword: string;
  category: string;
  weight: number;
  is_active: number;
  notes?: string;
}

export interface KeywordFilter {
  category?: string;
  is_active?: string;
  search?: string;
  page?: number;
  limit?: number;
}

async function listKeywords(filter: KeywordFilter = {}): Promise<{ items: Keyword[]; total: number }> {
  const params = new URLSearchParams();
  if (filter.category) params.set('category', filter.category);
  if (filter.is_active !== undefined) params.set('is_active', filter.is_active);
  if (filter.search) params.set('search', filter.search);
  if (filter.page) params.set('page', String(filter.page));
  params.set('limit', String(filter.limit || 100));
  const res = await webmonClient.get(`/api/v1/keywords?${params}`);
  const d = res.data?.data || {};
  return { items: d.items || [], total: d.total || 0 };
}

async function createKeyword(data: Omit<Keyword, 'id'>): Promise<Keyword> {
  const res = await webmonClient.post('/api/v1/keywords', data);
  return res.data.data;
}

async function updateKeyword(id: number, data: Partial<Keyword>): Promise<Keyword> {
  const res = await webmonClient.put(`/api/v1/keywords/${id}`, data);
  return res.data.data;
}

async function deleteKeyword(id: number): Promise<void> {
  await webmonClient.delete(`/api/v1/keywords/${id}`);
}

async function seedDefault(): Promise<void> {
  await webmonClient.post('/api/v1/keywords/seed');
}

export const keywordService = { listKeywords, createKeyword, updateKeyword, deleteKeyword, seedDefault };
