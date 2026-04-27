/**
 * Scheduler Service for Feeder
 * Service untuk mengelola scheduled sync jobs pada Feeder Service
 */

import { feederClient } from '@/lib/api/feederClient';

// Types
export interface ScheduledSync {
  id: number;
  name: string;
  description: string;
  sync_type: 'mahasiswa' | 'aktivitas_mahasiswa' | 'kurikulum' | 'rencana_evaluasi' | 'kelas_kuliah' | 'nilai_perkuliahan' | 'nilai_konversi' | 'transkrip_nilai' | 'bimbing_mhs';
  endpoint_key?: string | null;
  cron_expression: string;
  schedule_time?: string | null;
  is_active: boolean;
  next_run_at?: string | null;
  last_run_at?: string | null;
  created_at: string;
  created_by: string;
  // Helper fields
  angkatan?: string | null;
  id_semester?: string[] | null;
  id_prodi?: string | null;
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
  sync_type: 'mahasiswa' | 'aktivitas_mahasiswa' | 'kurikulum' | 'rencana_evaluasi' | 'kelas_kuliah' | 'nilai_perkuliahan' | 'nilai_konversi' | 'transkrip_nilai' | 'bimbing_mhs';
  schedule_date: string; // YYYY-MM-DD
  schedule_time: string; // HH:mm
  angkatan?: string; // Comma-separated for mahasiswa
  id_semester?: string[]; // For aktivitas_mahasiswa
  id_prodi?: string; // For filtering
  is_active: boolean;
  created_by: string;
}

export interface UpdateScheduleRequest {
  name?: string;
  description?: string;
  schedule_date?: string;
  schedule_time?: string;
  angkatan?: string;
  id_semester?: string[];
  id_prodi?: string;
  is_active?: boolean;
}

/**
 * Feeder Scheduler API Service
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
    const response = await feederClient.get<{
      success: boolean;
      data: ScheduledSyncListResponse;
    }>('/schedules', { params });
    return response.data.data;
  },

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: number): Promise<ScheduledSync> {
    const response = await feederClient.get<{
      success: boolean;
      data: ScheduledSync;
    }>(`/schedules/${id}`);
    return response.data.data;
  },

  /**
   * Create new scheduled sync
   */
  async createSchedule(data: CreateScheduleRequest): Promise<ScheduledSync> {
    const response = await feederClient.post<{
      success: boolean;
      data: ScheduledSync;
      message: string;
    }>('/schedules', data);
    return response.data.data;
  },

  /**
   * Update scheduled sync
   */
  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<ScheduledSync> {
    const response = await feederClient.put<{
      success: boolean;
      data: ScheduledSync;
      message: string;
    }>(`/schedules/${id}`, data);
    return response.data.data;
  },

  /**
   * Delete scheduled sync
   */
  async deleteSchedule(id: number): Promise<void> {
    await feederClient.delete(`/schedules/${id}`);
  },

  /**
   * Toggle schedule active status
   */
  async toggleSchedule(id: number, isActive: boolean): Promise<void> {
    await feederClient.patch(`/schedules/${id}/toggle`, null, {
      params: {
        is_active: isActive,
      },
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
      mahasiswa: 'Mahasiswa',
      aktivitas_mahasiswa: 'Aktivitas Mahasiswa',
      kurikulum: 'Kurikulum',
      rencana_evaluasi: 'Rencana Evaluasi',
      kelas_kuliah: 'Kelas Kuliah',
      nilai_perkuliahan: 'Nilai Perkuliahan',
      nilai_konversi: 'Nilai Konversi',
      transkrip_nilai: 'Transkrip Nilai',
      bimbing_mhs: 'Bimbingan Mahasiswa',
    };
    return labels[syncType] || syncType;
  },

  /**
   * Get sync type color
   */
  getSyncTypeColor(syncType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
      mahasiswa: 'primary',
      aktivitas_mahasiswa: 'secondary',
      kurikulum: 'success',
      rencana_evaluasi: 'warning',
      kelas_kuliah: 'primary',
      nilai_perkuliahan: 'warning',
      nilai_konversi: 'warning',
      transkrip_nilai: 'success',
      bimbing_mhs: 'secondary',
    };
    return colors[syncType] || 'default';
  },
};
