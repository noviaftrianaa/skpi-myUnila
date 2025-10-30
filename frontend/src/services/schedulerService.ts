import axios from 'axios';

const SCHEDULER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083';

export interface ScheduledSync {
  id: number;
  name: string;
  description: string;
  sync_type: 'referensi' | 'dosen';
  endpoint_key: string | null;
  cron_expression: string;
  schedule_time: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledSyncRequest {
  name: string;
  description?: string;
  sync_type: 'referensi' | 'dosen';
  endpoint_key?: string;
  schedule_date: string; // YYYY-MM-DD
  schedule_time: string; // HH:mm
  is_active: boolean;
  created_by: string;
}

export interface UpdateScheduledSyncRequest {
  name?: string;
  description?: string;
  schedule_date?: string;
  schedule_time?: string;
  is_active?: boolean;
}

export interface ScheduledSyncListResponse {
  data: ScheduledSync[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ScheduledSyncResponse {
  data: ScheduledSync;
  message: string;
}

export interface ToggleScheduleRequest {
  is_active: boolean;
}

export const schedulerService = {
  // Get all schedules with pagination and filters
  getSchedules: async (
    page: number = 1,
    limit: number = 10,
    syncType?: 'referensi' | 'dosen',
    isActive?: boolean
  ): Promise<ScheduledSyncListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (syncType) params.append('sync_type', syncType);
    if (isActive !== undefined) params.append('is_active', isActive.toString());

    const response = await axios.get(`${SCHEDULER_API_URL}/schedules?${params}`);
    return response.data;
  },

  // Get single schedule by ID
  getScheduleById: async (id: number): Promise<ScheduledSync> => {
    const response = await axios.get(`${SCHEDULER_API_URL}/schedules/${id}`);
    return response.data.data;
  },

  // Create new schedule
  createSchedule: async (request: CreateScheduledSyncRequest): Promise<ScheduledSync> => {
    const response = await axios.post(`${SCHEDULER_API_URL}/schedules`, request);
    return response.data.data;
  },

  // Update existing schedule
  updateSchedule: async (id: number, request: UpdateScheduledSyncRequest): Promise<ScheduledSync> => {
    const response = await axios.put(`${SCHEDULER_API_URL}/schedules/${id}`, request);
    return response.data.data;
  },

  // Delete schedule
  deleteSchedule: async (id: number): Promise<void> => {
    await axios.delete(`${SCHEDULER_API_URL}/schedules/${id}`);
  },

  // Toggle schedule active status
  toggleSchedule: async (id: number, isActive: boolean): Promise<void> => {
    await axios.post(`${SCHEDULER_API_URL}/schedules/${id}/toggle`, {
      is_active: isActive,
    });
  },
};
