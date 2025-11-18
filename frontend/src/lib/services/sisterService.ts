/**
 * SISTER API Service
 * Service untuk komunikasi dengan Sister Service API
 */

import { sisterClient } from '@/lib/api/sisterClient';

// sisterClient is already properly configured with:
// - Correct baseURL from environment variables
// - JWT token management using correct localStorage keys
// - Request/response interceptors for auth and error handling
// - Token refresh mechanism

// Types
export interface AgamaData {
  id_agama: number;
  nama_agama: string;
  expired_date?: string;
  last_sync?: string;
  synced_by?: string;
}

export interface UnitKerjaData {
  id_sms: string;
  id_sp: string;
  id_jenis_sms: number;
  nama_jenis_sms: string;
  nm_lemb: string;
  kode_prodi?: string | null;
  status_prodi?: string | null;
  id_fak_unila?: string | null;
  id_jur_unila?: string | null;
  id_induk_sms?: string | null;
  last_sync?: string;
  synced_by?: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data: {
    total_records: number;
    synced_by: string;
    message: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Referensi - Agama Services
export const agamaService = {
  // Get all agama
  getAll: async (): Promise<AgamaData[]> => {
    try {
      const response = await sisterClient.get<ApiResponse<AgamaData[]>>('/referensi/agama');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agama:', error);
      throw error;
    }
  },

  // Get agama by ID
  getById: async (id: number): Promise<AgamaData> => {
    try {
      const response = await sisterClient.get<ApiResponse<AgamaData>>(`/referensi/agama/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching agama with id ${id}:`, error);
      throw error;
    }
  },

  // Sync agama from Sister API
  sync: async (syncedBy: string): Promise<SyncResponse> => {
    try {
      const response = await sisterClient.post<SyncResponse>('/referensi/agama/sync', {
        synced_by: syncedBy,
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing agama:', error);
      throw error;
    }
  },
};

// Referensi - Unit Kerja Services
export const unitKerjaService = {
  // Get all unit kerja
  getAll: async (): Promise<UnitKerjaData[]> => {
    try {
      const response = await sisterClient.get<ApiResponse<UnitKerjaData[]>>('/referensi/unit-kerja');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching unit kerja:', error);
      throw error;
    }
  },

  // Get unit kerja by ID
  getById: async (id: string): Promise<UnitKerjaData> => {
    try {
      const response = await sisterClient.get<ApiResponse<UnitKerjaData>>(`/referensi/unit-kerja/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching unit kerja with id ${id}:`, error);
      throw error;
    }
  },

  // Sync unit kerja from Sister API
  sync: async (idPerguruanTinggi: string, syncedBy: string): Promise<SyncResponse> => {
    try {
      const response = await sisterClient.post<SyncResponse>(
        `/referensi/unit-kerja/sync?id_perguruan_tinggi=${idPerguruanTinggi}&synced_by=${syncedBy}`
      );
      return response.data;
    } catch (error) {
      console.error('Error syncing unit kerja:', error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await sisterClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default {
  agama: agamaService,
  unitKerja: unitKerjaService,
  healthCheck,
};
