import { webmonClient } from '@/lib/api/webmonClient';

export interface MonitoringSetting {
  id: number;
  key_group: string;
  setting_key: string;
  setting_value: string | null;
  description: string | null;
  is_sensitive: number;
}

async function listSettings(group?: string): Promise<MonitoringSetting[]> {
  const params = group ? `?group=${group}` : '';
  const res = await webmonClient.get(`/api/v1/settings${params}`);
  return res.data.data || [];
}

async function updateSetting(id: number, value: string | null): Promise<void> {
  await webmonClient.put(`/api/v1/settings/${id}`, { setting_value: value });
}

async function bulkUpdate(settings: { id: number; setting_value: string | null }[]): Promise<void> {
  await webmonClient.put('/api/v1/settings/bulk', { settings });
}

export const settingsService = { listSettings, updateSetting, bulkUpdate };
