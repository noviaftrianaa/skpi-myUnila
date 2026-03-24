/**
 * SIM-BAK Service Layer
 *
 * Service skeleton untuk semua API calls ke bak-service
 */

import bakClient from '@/lib/api/bakClient';
import type {
  ApiResponse,
  PaginatedResponse,
  JenisLayanan,
  Pengajuan,
  DashboardStats,
} from './types';

// ============ Jenis Layanan (Public) ============

export const getJenisLayanan = async (): Promise<JenisLayanan[]> => {
  const response = await bakClient.get<ApiResponse<JenisLayanan[]>>('/layanan/jenis-layanan');
  return response.data.data;
};

export const getJenisLayananByKategori = async (kategori: string): Promise<JenisLayanan[]> => {
  const response = await bakClient.get<ApiResponse<JenisLayanan[]>>('/layanan/jenis-layanan', {
    params: { kategori },
  });
  return response.data.data;
};

// ============ Pengajuan (Mahasiswa) ============

export const getMyPengajuan = async (page = 1, limit = 10): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/layanan/my-pengajuan', {
    params: { page, limit },
  });
  return response.data;
};

export const createPengajuan = async (data: {
  kode_layanan: string;
  catatan_pemohon?: string;
}): Promise<Pengajuan> => {
  const response = await bakClient.post<ApiResponse<Pengajuan>>('/layanan/pengajuan', data);
  return response.data.data;
};

export const getPengajuanDetail = async (id: string): Promise<Pengajuan> => {
  const response = await bakClient.get<ApiResponse<Pengajuan>>(`/layanan/pengajuan/${id}`);
  return response.data.data;
};

export const uploadDokumen = async (idPengajuan: string, formData: FormData): Promise<void> => {
  await bakClient.post(`/layanan/pengajuan/${idPengajuan}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const ajukanPengajuan = async (idPengajuan: string): Promise<void> => {
  await bakClient.post(`/layanan/pengajuan/${idPengajuan}/ajukan`);
};

export const downloadDokumen = (idDokumen: string): string => {
  return `${bakClient.defaults.baseURL}/layanan/dokumen/${idDokumen}/download`;
};

// ============ Admin Verifikasi ============

export const getAdminPengajuan = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  kode_layanan?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/admin/pengajuan', { params });
  return response.data;
};

export const verifikasiPengajuan = async (id: string, data: { catatan?: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/verifikasi`, data);
};

export const mintaPerbaikan = async (id: string, data: { catatan: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/perbaikan`, data);
};

export const terbitkanPengajuan = async (id: string, formData?: FormData): Promise<void> => {
  if (formData) {
    await bakClient.post(`/admin/pengajuan/${id}/terbitkan`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    await bakClient.post(`/admin/pengajuan/${id}/terbitkan`);
  }
};

// ============ Approval ============

export const getApprovalQueue = async (params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/approval/queue', { params });
  return response.data;
};

export const approvePengajuan = async (id: string, data?: { catatan?: string }): Promise<void> => {
  await bakClient.post(`/approval/${id}/approve`, data);
};

export const rejectPengajuan = async (id: string, data: { catatan: string }): Promise<void> => {
  await bakClient.post(`/approval/${id}/reject`, data);
};

// ============ Dashboard ============

export const getDashboardOverview = async (): Promise<DashboardStats> => {
  const response = await bakClient.get<ApiResponse<DashboardStats>>('/dashboard/overview');
  return response.data.data;
};

// ============ Export ============

const simBakService = {
  getJenisLayanan,
  getJenisLayananByKategori,
  getMyPengajuan,
  createPengajuan,
  getPengajuanDetail,
  uploadDokumen,
  ajukanPengajuan,
  downloadDokumen,
  getAdminPengajuan,
  verifikasiPengajuan,
  mintaPerbaikan,
  terbitkanPengajuan,
  getApprovalQueue,
  approvePengajuan,
  rejectPengajuan,
  getDashboardOverview,
};

export default simBakService;
