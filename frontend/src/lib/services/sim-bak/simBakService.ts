/**
 * SIM-BAK Service Layer
 *
 * All API calls ke simbak-service backend
 */

import bakClient from '@/lib/api/bakClient';
import type {
  ApiResponse,
  PaginatedResponse,
  JenisLayanan,
  PersyaratanLayanan,
  TahapanLayanan,
  TemplateDokumen,
  Pengajuan,
  DokumenPengajuan,
  RiwayatPengajuan,
  PersetujuanPengajuan,
  BatchPenetapan,
  KandidatBatch,
  DashboardStats,
} from './types';

// ============ Jenis Layanan (Public — no auth) ============

export const getJenisLayananPublic = async (): Promise<JenisLayanan[]> => {
  const response = await bakClient.get<ApiResponse<JenisLayanan[]>>('/layanan/jenis-layanan');
  return response.data.data;
};

// ============ Master Data: Jenis Layanan (Admin) ============

export const getJenisLayanan = async (params?: {
  page?: number; limit?: number; search?: string; kategori?: string;
}): Promise<PaginatedResponse<JenisLayanan>> => {
  const response = await bakClient.get<PaginatedResponse<JenisLayanan>>('/master-data/jenis-layanan', { params });
  return response.data;
};

export const getJenisLayananById = async (id: string): Promise<JenisLayanan> => {
  const response = await bakClient.get<ApiResponse<JenisLayanan>>(`/master-data/jenis-layanan/${id}`);
  return response.data.data;
};

export const createJenisLayanan = async (data: Partial<JenisLayanan>): Promise<JenisLayanan> => {
  const response = await bakClient.post<ApiResponse<JenisLayanan>>('/master-data/jenis-layanan', data);
  return response.data.data;
};

export const updateJenisLayanan = async (id: string, data: Partial<JenisLayanan>): Promise<JenisLayanan> => {
  const response = await bakClient.put<ApiResponse<JenisLayanan>>(`/master-data/jenis-layanan/${id}`, data);
  return response.data.data;
};

export const deleteJenisLayanan = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/jenis-layanan/${id}`);
};

export const getPersyaratanByLayanan = async (idJenisLayanan: string): Promise<PersyaratanLayanan[]> => {
  const response = await bakClient.get<ApiResponse<PersyaratanLayanan[]>>(`/master-data/jenis-layanan/${idJenisLayanan}/persyaratan`);
  return response.data.data;
};

export const getTahapanByLayanan = async (idJenisLayanan: string): Promise<TahapanLayanan[]> => {
  const response = await bakClient.get<ApiResponse<TahapanLayanan[]>>(`/master-data/jenis-layanan/${idJenisLayanan}/tahapan`);
  return response.data.data;
};

// ============ Master Data: Persyaratan (Admin) ============

export const getPersyaratan = async (params?: {
  page?: number; limit?: number; search?: string; id_jenis_layanan?: string;
}): Promise<PaginatedResponse<PersyaratanLayanan>> => {
  const response = await bakClient.get<PaginatedResponse<PersyaratanLayanan>>('/master-data/persyaratan', { params });
  return response.data;
};

export const createPersyaratan = async (data: Partial<PersyaratanLayanan>): Promise<PersyaratanLayanan> => {
  const response = await bakClient.post<ApiResponse<PersyaratanLayanan>>('/master-data/persyaratan', data);
  return response.data.data;
};

export const updatePersyaratan = async (id: string, data: Partial<PersyaratanLayanan>): Promise<PersyaratanLayanan> => {
  const response = await bakClient.put<ApiResponse<PersyaratanLayanan>>(`/master-data/persyaratan/${id}`, data);
  return response.data.data;
};

export const deletePersyaratan = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/persyaratan/${id}`);
};

// ============ Master Data: Tahapan (Admin) ============

export const getTahapan = async (params?: {
  page?: number; limit?: number; search?: string; id_jenis_layanan?: string;
}): Promise<PaginatedResponse<TahapanLayanan>> => {
  const response = await bakClient.get<PaginatedResponse<TahapanLayanan>>('/master-data/tahapan', { params });
  return response.data;
};

export const createTahapan = async (data: Partial<TahapanLayanan>): Promise<TahapanLayanan> => {
  const response = await bakClient.post<ApiResponse<TahapanLayanan>>('/master-data/tahapan', data);
  return response.data.data;
};

export const updateTahapan = async (id: string, data: Partial<TahapanLayanan>): Promise<TahapanLayanan> => {
  const response = await bakClient.put<ApiResponse<TahapanLayanan>>(`/master-data/tahapan/${id}`, data);
  return response.data.data;
};

export const deleteTahapan = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/tahapan/${id}`);
};

// ============ Master Data: Template Dokumen (Admin) ============

export const getTemplate = async (params?: {
  page?: number; limit?: number; search?: string;
}): Promise<PaginatedResponse<TemplateDokumen>> => {
  const response = await bakClient.get<PaginatedResponse<TemplateDokumen>>('/master-data/template-dokumen', { params });
  return response.data;
};

export const createTemplate = async (data: Partial<TemplateDokumen>): Promise<TemplateDokumen> => {
  const response = await bakClient.post<ApiResponse<TemplateDokumen>>('/master-data/template-dokumen', data);
  return response.data.data;
};

export const updateTemplate = async (id: string, data: Partial<TemplateDokumen>): Promise<TemplateDokumen> => {
  const response = await bakClient.put<ApiResponse<TemplateDokumen>>(`/master-data/template-dokumen/${id}`, data);
  return response.data.data;
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/template-dokumen/${id}`);
};

// ============ Pengajuan (Mahasiswa) ============

export const getMyPengajuan = async (params?: {
  page?: number; limit?: number; search?: string; status?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/layanan/my-pengajuan', { params });
  return response.data;
};

export const createPengajuan = async (data: {
  id_jenis_layanan: string;
  alasan?: string;
  catatan_pemohon?: string;
  id_smt_mulai_cuti?: string;
  jumlah_semester_cuti?: number;
  id_prodi_tujuan?: string;
  id_fakultas_tujuan?: string;
}): Promise<Pengajuan> => {
  const response = await bakClient.post<ApiResponse<Pengajuan>>('/layanan/pengajuan', data);
  return response.data.data;
};

export const getPengajuanDetail = async (id: string): Promise<Record<string, unknown>> => {
  const response = await bakClient.get<ApiResponse<Record<string, unknown>>>(`/layanan/pengajuan/${id}`);
  return response.data.data;
};

export const uploadDokumen = async (idPengajuan: string, formData: FormData): Promise<DokumenPengajuan> => {
  const response = await bakClient.post<ApiResponse<DokumenPengajuan>>(
    `/layanan/pengajuan/${idPengajuan}/upload`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const ajukanPengajuan = async (idPengajuan: string): Promise<void> => {
  await bakClient.post(`/layanan/pengajuan/${idPengajuan}/ajukan`);
};

export const deleteDokumen = async (idDokumen: string): Promise<void> => {
  await bakClient.delete(`/layanan/dokumen/${idDokumen}`);
};

export const downloadDokumenUrl = (idDokumen: string): string => {
  return `${bakClient.defaults.baseURL}/layanan/dokumen/${idDokumen}/download`;
};

export const downloadDokumenHasilUrl = (idDokumenHasil: string): string => {
  return `${bakClient.defaults.baseURL}/layanan/dokumen-hasil/${idDokumenHasil}/download`;
};

// ============ Admin: Verifikasi ============

export const getAdminPengajuan = async (params?: {
  page?: number; limit?: number; search?: string; status?: string; kode_layanan?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/admin/pengajuan', { params });
  return response.data;
};

export const verifikasiPengajuan = async (id: string, data?: { catatan?: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/verifikasi`, data);
};

export const mintaPerbaikan = async (id: string, data: { catatan: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/perbaikan`, data);
};

export const terbitkanPengajuan = async (id: string, data?: { nomor_dokumen?: string; catatan?: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/terbitkan`, data);
};

// ============ Approval ============

export const getApprovalQueue = async (params?: {
  page?: number; limit?: number;
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

// ============ Batch ============

export const getBatchList = async (params?: {
  page?: number; limit?: number; jenis_batch?: string; status?: string;
}): Promise<PaginatedResponse<BatchPenetapan>> => {
  const response = await bakClient.get<PaginatedResponse<BatchPenetapan>>('/batch', { params });
  return response.data;
};

export const createBatch = async (data: {
  id_jenis_layanan: string;
  nm_batch: string;
  jenis_batch: string;
  id_smt: string;
  kriteria_snapshot?: string;
  catatan?: string;
}): Promise<BatchPenetapan> => {
  const response = await bakClient.post<ApiResponse<BatchPenetapan>>('/batch', data);
  return response.data.data;
};

export const getBatchDetail = async (id: string): Promise<BatchPenetapan> => {
  const response = await bakClient.get<ApiResponse<BatchPenetapan>>(`/batch/${id}`);
  return response.data.data;
};

export const getBatchKandidat = async (id: string, params?: {
  page?: number; limit?: number; status_kandidat?: string; id_fakultas?: string;
}): Promise<PaginatedResponse<KandidatBatch>> => {
  const response = await bakClient.get<PaginatedResponse<KandidatBatch>>(`/batch/${id}/kandidat`, { params });
  return response.data;
};

export const verifikasiKandidat = async (idKandidat: string, data: {
  hasil: 'valid' | 'dikeluarkan';
  catatan?: string;
}): Promise<void> => {
  await bakClient.post(`/batch/kandidat/${idKandidat}/verifikasi`, data);
};

export const finalizeBatch = async (id: string, data?: {
  nomor_sk_rektor?: string;
  tgl_sk_rektor?: string;
}): Promise<void> => {
  await bakClient.post(`/batch/${id}/finalize`, data);
};

// ============ Dashboard ============

export const getDashboardOverview = async (): Promise<DashboardStats> => {
  const response = await bakClient.get<ApiResponse<DashboardStats>>('/dashboard/overview');
  return response.data.data;
};

export const getDashboardSla = async (): Promise<{
  total_selesai: number;
  tepat_waktu: number;
  percentage: number;
}> => {
  const response = await bakClient.get<ApiResponse<{ total_selesai: number; tepat_waktu: number; percentage: number }>>('/dashboard/sla');
  return response.data.data;
};

export const getDashboardTrends = async (): Promise<Array<{
  bulan: string; total: number; surat_mandiri: number; permohonan: number; batch: number;
}>> => {
  const response = await bakClient.get<ApiResponse<Array<{ bulan: string; total: number; surat_mandiri: number; permohonan: number; batch: number }>>>('/dashboard/trends');
  return response.data.data;
};

export const getDashboardActivity = async (limit?: number): Promise<RiwayatPengajuan[]> => {
  const response = await bakClient.get<ApiResponse<RiwayatPengajuan[]>>('/dashboard/activity-log', { params: { limit } });
  return response.data.data;
};

// ============ Monitoring ============

export const getMahasiswaAktif = async (params?: {
  page?: number; limit?: number; fakultas?: string;
}): Promise<PaginatedResponse<Record<string, unknown>>> => {
  const response = await bakClient.get<PaginatedResponse<Record<string, unknown>>>('/monitoring/mahasiswa-aktif', { params });
  return response.data;
};

export const getLulusan = async (params?: {
  page?: number; limit?: number; fakultas?: string; tahun?: number;
}): Promise<PaginatedResponse<Record<string, unknown>>> => {
  const response = await bakClient.get<PaginatedResponse<Record<string, unknown>>>('/monitoring/lulusan', { params });
  return response.data;
};

export const exportMonitoring = async (params?: Record<string, unknown>): Promise<string> => {
  const response = await bakClient.get<ApiResponse<{ url: string }>>('/monitoring/export', { params });
  return response.data.data.url;
};

// ============ Default Export ============

const simBakService = {
  // Public
  getJenisLayananPublic,
  // Master Data
  getJenisLayanan, getJenisLayananById, createJenisLayanan, updateJenisLayanan, deleteJenisLayanan,
  getPersyaratanByLayanan, getTahapanByLayanan,
  getPersyaratan, createPersyaratan, updatePersyaratan, deletePersyaratan,
  getTahapan, createTahapan, updateTahapan, deleteTahapan,
  getTemplate, createTemplate, updateTemplate, deleteTemplate,
  // Pengajuan
  getMyPengajuan, createPengajuan, getPengajuanDetail,
  uploadDokumen, ajukanPengajuan, deleteDokumen,
  downloadDokumenUrl, downloadDokumenHasilUrl,
  // Admin
  getAdminPengajuan, verifikasiPengajuan, mintaPerbaikan, terbitkanPengajuan,
  // Approval
  getApprovalQueue, approvePengajuan, rejectPengajuan,
  // Batch
  getBatchList, createBatch, getBatchDetail, getBatchKandidat, verifikasiKandidat, finalizeBatch,
  // Dashboard
  getDashboardOverview, getDashboardSla, getDashboardTrends, getDashboardActivity,
  // Monitoring
  getMahasiswaAktif, getLulusan, exportMonitoring,
};

export default simBakService;
