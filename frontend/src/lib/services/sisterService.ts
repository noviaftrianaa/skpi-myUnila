/**
 * SISTER API Service
 * Service untuk komunikasi dengan Sister Service API
 */

import axios from 'axios';

// Base URL untuk Sister Service
const SISTER_API_BASE_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:9800/sister-service/api/v1';

// Create axios instance with interceptor for auth token
const sisterApiClient = axios.create({
  baseURL: SISTER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
sisterApiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
sisterApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface AgamaData {
  id_agama: number;
  nama_agama: string;
  expired_date?: string;
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
      const response = await sisterApiClient.get<ApiResponse<AgamaData[]>>('/referensi/agama');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching agama:', error);
      throw error;
    }
  },

  // Get agama by ID
  getById: async (id: number): Promise<AgamaData> => {
    try {
      const response = await sisterApiClient.get<ApiResponse<AgamaData>>(`/referensi/agama/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching agama with id ${id}:`, error);
      throw error;
    }
  },

  // Sync agama from Sister API
  sync: async (syncedBy: string): Promise<SyncResponse> => {
    try {
      const response = await sisterApiClient.post<SyncResponse>('/referensi/agama/sync', {
        synced_by: syncedBy,
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing agama:', error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await sisterApiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default {
  agama: agamaService,
  healthCheck,
};
