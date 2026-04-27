/**
 * Scheduler Service for MyUnila Integrator
 * Service untuk mengelola scheduled sync jobs
 */

import { myunilaClient } from '@/lib/api/myunilaClient';

// Types
export interface ScheduledSync {
  id: number;
  name: string;
  description: string;
  sync_type: 'pegawai' | 'radius' | 'unit_organisasi' | 'daftar_ukt' | 'spp_mhs' | 'siakadu_referensi' | 'siakadu_mahasiswa' | 'siakadu_akademik' | 'siakadu_kelas' | 'siakadu_kurikulum' | 'siakadu_matakuliah' | 'siakadu_khs' | 'siakadu_kuliah' | 'siakadu_transkrip' | 'siakadu_wisuda';
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
  sync_type: 'pegawai' | 'radius' | 'unit_organisasi' | 'daftar_ukt' | 'spp_mhs' | 'siakadu_referensi' | 'siakadu_mahasiswa' | 'siakadu_akademik' | 'siakadu_kelas' | 'siakadu_kurikulum' | 'siakadu_matakuliah' | 'siakadu_khs' | 'siakadu_kuliah' | 'siakadu_transkrip' | 'siakadu_wisuda';
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
    const response = await myunilaClient.get<ScheduledSyncListResponse>(
      '/schedules',
      { params }
    );
    return response.data;
  },

  /**
   * Get schedule by ID
   */
  async getScheduleById(id: number): Promise<ScheduledSync> {
    const response = await myunilaClient.get<ScheduledSync>(
      `/schedules/${id}`
    );
    return response.data;
  },

  /**
   * Create new scheduled sync
   */
  async createSchedule(data: CreateScheduleRequest): Promise<ScheduledSync> {
    const response = await myunilaClient.post<ScheduledSync>(
      '/schedules',
      data
    );
    return response.data;
  },

  /**
   * Update scheduled sync
   */
  async updateSchedule(id: number, data: UpdateScheduleRequest): Promise<ScheduledSync> {
    const response = await myunilaClient.put<ScheduledSync>(
      `/schedules/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete scheduled sync
   */
  async deleteSchedule(id: number): Promise<void> {
    await myunilaClient.delete(`/schedules/${id}`);
  },

  /**
   * Toggle schedule active status
   */
  async toggleSchedule(id: number, isActive: boolean): Promise<void> {
    await myunilaClient.post(`/schedules/${id}/toggle`, {
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
      pegawai: 'Pegawai SIKEP',
      radius: 'Radius SSO',
      unit_organisasi: 'Unit Organisasi',
      daftar_ukt: 'Daftar UKT',
      spp_mhs: 'SPP Mahasiswa',
      siakadu_referensi: 'SIAKADU Referensi Unit',
      siakadu_mahasiswa: 'SIAKADU Mahasiswa',
      siakadu_akademik: 'SIAKADU Akademik',
      siakadu_kelas: 'SIAKADU Kelas',
      siakadu_kurikulum: 'SIAKADU Kurikulum',
      siakadu_matakuliah: 'SIAKADU Mata Kuliah',
      siakadu_khs: 'SIAKADU KHS',
      siakadu_kuliah: 'SIAKADU Status Kuliah',
      siakadu_transkrip: 'SIAKADU Transkrip',
      siakadu_wisuda: 'SIAKADU Wisuda',
    };
    return labels[syncType] || syncType;
  },

  /**
   * Get sync type color
   */
  getSyncTypeColor(syncType: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default' {
    const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'> = {
      pegawai: 'primary',
      radius: 'secondary',
      unit_organisasi: 'success',
      daftar_ukt: 'warning',
      spp_mhs: 'danger',
      siakadu_referensi: 'secondary',
      siakadu_mahasiswa: 'primary',
      siakadu_akademik: 'success',
      siakadu_kelas: 'primary',
      siakadu_kurikulum: 'success',
      siakadu_matakuliah: 'warning',
      siakadu_khs: 'warning',
      siakadu_kuliah: 'default',
      siakadu_transkrip: 'success',
      siakadu_wisuda: 'danger',
    };
    return colors[syncType] || 'default';
  },
};
