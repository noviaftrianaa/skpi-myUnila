/**
 * Scheduler Service
 * Service untuk mengelola scheduled sync jobs
 */

import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083';

// Types
export interface ScheduledSync {
  id: number;
  name: string;
  description: string;
  sync_type: 'dosen' | 'referensi' | 'penugasan' | 'penelitian' | 'pengabdian' | 'pendidikan';
  endpoint_key?: string | null;
  cron_expression: string;
  schedule_time?: string | null;
  is_active: boolean;
  next_run_at?: string | null;
  last_run_at?: string | null;
  created_at: string;
  created_by: string;
}

export interface ScheduledSyncListResponse {
  data: ScheduledSync[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface CreateScheduleRequest {
  name: string;
  description: string;
  sync_type: 'dosen' | 'referensi' | 'penugasan' | 'penelitian' | 'pengabdian' | 'pendidikan';
  endpoint_key?: string;
  schedule_date: string; // YYYY-MM-DD
  schedule_time: string; // HH:mm
  is_active: boolean;
  created_by: string;
}

export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  schedule_date?: string;
  schedule_time?: string;
  is_active?: boolean;
}

/**
 * Scheduler API Service
 */
export const schedulerService = {
  /**
   * Get paginated list of scheduled syncs
   */
  async getSchedules(params: {
    page?: number;
    limit?: number;
    sync_type?: string;
    is_active?: boolean;
  }): Promise<ScheduledSyncListResponse> {
    const response = await axios.get<ScheduledSyncListResponse>(
      `${SISTER_API_URL}/api/v1/schedules`,
      { params }
    );
    return response.data;
  },

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: number): Promise<ScheduledSync> {
    const response = await axios.get<ScheduledSync>(
      `${SISTER_API_URL}/api/v1/schedules/${id}`
    );
    return response.data;
  },

  /**
   * Create new scheduled sync
   */
  async createSchedule(data: CreateScheduleRequest): Promise<ScheduledSync> {
    const response = await axios.post<ScheduledSync>(
      `${SISTER_API_URL}/api/v1/schedules`,
      data
    );
    return response.data;
  },

  /**
   * Update scheduled sync
   */
  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<ScheduledSync> {
    const response = await axios.put<ScheduledSync>(
      `${SISTER_API_URL}/api/v1/schedules/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete scheduled sync
   */
  async deleteSchedule(id: number): Promise<void> {
    await axios.delete(`/api/v1/schedules/${id}`);
  },

  /**
   * Toggle schedule active status
   */
  async toggleSchedule(id: number, isActive: boolean): Promise<void> {
    await axios.patch(`/api/v1/schedules/${id}/toggle`, {
      is_active: isActive,
    });
  },
};

/**
 * Helper functions
 */
export const schedulerHelpers = {
  /**
   * Format date and time for display
   */
  formatDateTime(dateString?: string | null): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  },

  /**
   * Format date only
   */
  formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  },

  /**
   * Format time only
   */
  formatTime(dateString?: string | null): string {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  },

  /**
   * Get sync type label
   */
  getSyncTypeLabel(syncType: string): string {
    const labels: Record<string, string> = {
      dosen: 'Dosen',
      referensi: 'Referensi',
      penugasan: 'Penugasan',
      penelitian: 'Penelitian',
      pengabdian: 'Pengabdian',
      pendidikan: 'Pendidikan Formal',
    };
    return labels[syncType] || syncType;
  },

  /**
   * Get sync type color
   */
  getSyncTypeColor(syncType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
      dosen: 'primary',
      referensi: 'secondary',
      penugasan: 'success',
      penelitian: 'warning',
      pengabdian: 'warning',
      pendidikan: 'danger',
    };
    return colors[syncType] || 'default';
  },
};
