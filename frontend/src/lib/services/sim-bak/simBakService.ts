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
  KategoriCuti,
  KategoriUndur,
  KetentuanLayanan,
  KetentuanByLayananResponse,
  RiwayatCutiResponse,
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

// ============ Profil Akademik (dari PDUT) ============

export const getMyProfile = async (): Promise<Record<string, unknown>> => {
  const response = await bakClient.get<ApiResponse<Record<string, unknown>>>('/layanan/my-profile');
  return response.data.data;
};

// ============ Workflow Progress ============

export interface WorkflowProgress {
  current: number;
  total: number;
  tahapan_list: Array<{
    id_tahapan: string;
    urutan: number;
    nm_tahapan: string;
    kode_role: string;
    status_masuk: string;
    status_selesai: string;
    stage_status: 'completed' | 'active' | 'pending';
  }>;
}

export const getWorkflowProgress = async (idPengajuan: string): Promise<WorkflowProgress> => {
  const response = await bakClient.get<ApiResponse<WorkflowProgress>>(`/admin/pengajuan/${idPengajuan}/progress`);
  return response.data.data;
};

// ============ Referensi PDUT (Dropdown) ============

export const getRefFakultas = async (): Promise<Array<{ id_fakultas: string; nm_fakultas: string }>> => {
  const response = await bakClient.get<ApiResponse<Array<{ id_fakultas: string; nm_fakultas: string }>>>('/layanan/referensi/fakultas');
  return response.data.data;
};

export const getRefProdi = async (idFakultas?: string): Promise<Array<{ id_prodi: string; nm_prodi: string; kode_prodi: string; id_fakultas: string; nm_jenjang: string }>> => {
  const response = await bakClient.get<ApiResponse<Array<{ id_prodi: string; nm_prodi: string; kode_prodi: string; id_fakultas: string; nm_jenjang: string }>>>('/layanan/referensi/prodi', {
    params: idFakultas ? { id_fakultas: idFakultas } : undefined,
  });
  return response.data.data;
};

export const getRefSemester = async (): Promise<Array<{ id_smt: string; nm_smt: string; a_periode_aktif: boolean }>> => {
  const response = await bakClient.get<ApiResponse<Array<{ id_smt: string; nm_smt: string; a_periode_aktif: boolean }>>>('/layanan/referensi/semester');
  return response.data.data;
};

export const terimaTujuanAlihProgram = async (id: string, data: {
  a_diterima_tujuan: boolean;
  hasil_wawancara?: string;
  daftar_konversi_sks?: string;
  catatan?: string;
}): Promise<void> => {
  await bakClient.post(`/approval/${id}/terima-tujuan`, data);
};

// ============ Pengajuan (Mahasiswa) ============

export const getMyPengajuan = async (params?: {
  page?: number; limit?: number; search?: string; status?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/layanan/my-pengajuan', { params });
  return response.data;
};

export const getMyStats = async (): Promise<{
  total: number; draft: number; proses: number; selesai: number; ditolak: number; perbaikan: number;
}> => {
  const response = await bakClient.get<ApiResponse<{
    total: number; draft: number; proses: number; selesai: number; ditolak: number; perbaikan: number;
  }>>('/layanan/my-stats');
  return response.data.data;
};

export const createPengajuan = async (data: {
  id_jenis_layanan: string;
  alasan?: string;
  catatan_pemohon?: string;
  id_smt_mulai_cuti?: string;
  id_smt_akhir_cuti?: string;
  jumlah_semester_cuti?: number;
  kategori_cuti?: string;
  kategori_undur?: string;
  nm_pt_tujuan?: string;
  id_prodi_tujuan?: string;
  id_fakultas_tujuan?: string;
  nomor_surat_polisi?: string;
  tgl_surat_polisi?: string;
  nomor_surat_ket_aktif?: string;
  tgl_surat_ket_aktif?: string;
  nomor_sk_cuti?: string;
  tgl_sk_cuti?: string;
}): Promise<Pengajuan> => {
  const response = await bakClient.post<ApiResponse<Pengajuan>>('/layanan/pengajuan', data);
  return response.data.data;
};

export const getPengajuanDetail = async (id: string): Promise<Pengajuan> => {
  const response = await bakClient.get<ApiResponse<Pengajuan>>(`/layanan/pengajuan/${id}`);
  return response.data.data;
};

export const createPengajuanEksternal = async (formData: FormData): Promise<Pengajuan> => {
  const response = await bakClient.post<ApiResponse<Pengajuan>>(
    '/admin/pengajuan/eksternal',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data.data;
};

export const cekKrsPengajuan = async (id: string): Promise<{ ada_krs: boolean; nim?: string; id_smt?: string; sks_semester?: number; message: string }> => {
  const response = await bakClient.get<ApiResponse<{ ada_krs: boolean; nim?: string; id_smt?: string; sks_semester?: number; message: string }>>(`/layanan/pengajuan/${id}/cek-krs`);
  return response.data.data;
};

export const getRiwayatCutiPengajuan = async (id: string): Promise<RiwayatCutiResponse> => {
  const response = await bakClient.get<ApiResponse<RiwayatCutiResponse>>(`/admin/pengajuan/${id}/riwayat-cuti`);
  return response.data.data;
};

export const getWhatsAppLinkPengajuan = async (
  id: string,
  event: string = 'status_terbit'
): Promise<{ telepon: string; wa_url: string; pesan: string; nama: string }> => {
  const response = await bakClient.get<ApiResponse<{ telepon: string; wa_url: string; pesan: string; nama: string }>>(
    `/admin/pengajuan/${id}/wa-link`,
    { params: { event } }
  );
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

export const deletePengajuanDraft = async (idPengajuan: string): Promise<void> => {
  await bakClient.delete(`/layanan/pengajuan/${idPengajuan}`);
};

export const downloadDokumenUrl = (idDokumen: string): string => {
  return `${bakClient.defaults.baseURL}/layanan/dokumen/${idDokumen}/download`;
};

export const downloadDokumenHasilUrl = (idDokumenHasil: string): string => {
  return `${bakClient.defaults.baseURL}/layanan/dokumen-hasil/${idDokumenHasil}/download`;
};

// ============ Admin: Verifikasi ============

export const getAdminPengajuan = async (params?: {
  page?: number; limit?: number; search?: string; status?: string; kode_layanan?: string; nm_fakultas?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/admin/pengajuan', { params });
  return response.data;
};

export const getVerifikasiQueue = async (params?: {
  page?: number; limit?: number; search?: string; kode_layanan?: string;
}): Promise<PaginatedResponse<Pengajuan>> => {
  const response = await bakClient.get<PaginatedResponse<Pengajuan>>('/admin/verifikasi/queue', { params });
  return response.data;
};

export const verifikasiPengajuan = async (id: string, data?: {
  catatan?: string;
  surat_pengantar?: File;
  nomor_surat_pengantar?: string;
  tgl_surat_pengantar?: string;
}): Promise<void> => {
  if (data?.surat_pengantar) {
    const formData = new FormData();
    if (data.catatan) formData.append('catatan', data.catatan);
    formData.append('surat_pengantar', data.surat_pengantar);
    if (data.nomor_surat_pengantar) formData.append('nomor_surat_pengantar', data.nomor_surat_pengantar);
    if (data.tgl_surat_pengantar) formData.append('tgl_surat_pengantar', data.tgl_surat_pengantar);
    await bakClient.post(`/admin/pengajuan/${id}/verifikasi`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } else {
    await bakClient.post(`/admin/pengajuan/${id}/verifikasi`, data);
  }
};

export const mintaPerbaikan = async (id: string, data: { catatan: string }): Promise<void> => {
  await bakClient.post(`/admin/pengajuan/${id}/perbaikan`, data);
};

export const terbitkanPengajuan = async (id: string, data: {
  nomor_dokumen?: string;
  tgl_dokumen?: string;
  catatan?: string;
  file?: File;
  file_penolakan?: File;
  nomor_penolakan?: string;
}): Promise<void> => {
  const formData = new FormData();
  if (data.nomor_dokumen) formData.append('nomor_dokumen', data.nomor_dokumen);
  if (data.tgl_dokumen) formData.append('tgl_dokumen', data.tgl_dokumen);
  if (data.catatan) formData.append('catatan', data.catatan);
  if (data.file) formData.append('file', data.file);
  if (data.file_penolakan) formData.append('file_penolakan', data.file_penolakan);
  if (data.nomor_penolakan) formData.append('nomor_penolakan', data.nomor_penolakan);
  await bakClient.post(`/admin/pengajuan/${id}/terbitkan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// ============ Approval ============

// ============ Batch (extended) ============

export const previewBatchCandidates = async (params: {
  jenis_batch: string; id_smt: string; id_fakultas?: string;
}): Promise<{ total: number; candidates: Array<Record<string, unknown>>; kriteria: string }> => {
  const response = await bakClient.get<ApiResponse<{ total: number; candidates: Array<Record<string, unknown>>; kriteria: string }>>('/batch/preview-candidates', { params });
  return response.data.data;
};

export const pullBatchCandidates = async (idBatch: string): Promise<{ jumlah_kandidat: number }> => {
  const response = await bakClient.post<ApiResponse<{ jumlah_kandidat: number }>>(`/batch/${idBatch}/pull-candidates`);
  return response.data.data;
};

export const sendBatchToFakultas = async (idBatch: string): Promise<void> => {
  await bakClient.post(`/batch/${idBatch}/send-to-fakultas`);
};

export const deleteBatch = async (idBatch: string, alasan?: string): Promise<void> => {
  await bakClient.delete(`/batch/${idBatch}`, { data: alasan ? { alasan } : {} });
};

export const uploadSkDekan = async (idBatch: string, formData: FormData): Promise<void> => {
  await bakClient.post(`/batch/${idBatch}/upload-sk-dekan`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const downloadSkDekanUrl = (idBatch: string): string =>
  `${bakClient.defaults.baseURL}/batch/${idBatch}/sk-dekan/download`;

export const deleteSkDekan = async (idBatch: string): Promise<void> => {
  await bakClient.delete(`/batch/${idBatch}/sk-dekan`);
};

export const finalizeBatchWithSK = async (idBatch: string, data: {
  nomor_sk_rektor?: string; tgl_sk_rektor?: string; file?: File;
}): Promise<void> => {
  const formData = new FormData();
  if (data.nomor_sk_rektor) formData.append('nomor_sk_rektor', data.nomor_sk_rektor);
  if (data.tgl_sk_rektor) formData.append('tgl_sk_rektor', data.tgl_sk_rektor);
  if (data.file) formData.append('file', data.file);
  await bakClient.post(`/batch/${idBatch}/finalize`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const exportBatchKandidatUrl = (idBatch: string, params?: {
  status_kandidat?: string; id_fakultas?: string;
}): string => {
  const baseUrl = bakClient.defaults.baseURL || '';
  const query = new URLSearchParams();
  if (params?.status_kandidat) query.set('status_kandidat', params.status_kandidat);
  if (params?.id_fakultas) query.set('id_fakultas', params.id_fakultas);
  return `${baseUrl}/batch/${idBatch}/export-kandidat${query.toString() ? '?' + query.toString() : ''}`;
};

export const finalizeVerifikasiFakultas = async (idBatch: string): Promise<void> => {
  await bakClient.post(`/batch/${idBatch}/finalize-verifikasi`);
};

export const resetKandidatStatus = async (idKandidat: string): Promise<void> => {
  await bakClient.post(`/batch/kandidat/${idKandidat}/reset`);
};

export const returnBatchToFakultas = async (idBatch: string, alasan: string): Promise<void> => {
  await bakClient.post(`/batch/${idBatch}/return-to-fakultas`, { alasan });
};

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
  page?: number; limit?: number; jenis_batch?: string; status?: string; id_fakultas?: string; my_fakultas?: string;
}): Promise<PaginatedResponse<BatchPenetapan>> => {
  const response = await bakClient.get<PaginatedResponse<BatchPenetapan>>('/batch', { params });
  return response.data;
};

export const createBatch = async (data: {
  id_jenis_layanan: string;
  nm_batch: string;
  jenis_batch: string;
  id_smt: string;
  id_fakultas: string;
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

export const verifikasiKandidat = async (idKandidat: string, data: FormData | {
  hasil: 'dikonfirmasi' | 'dikeluarkan';
  catatan?: string;
  alasan_exclude?: string;
  alasan_exclude_lainnya?: string;
}): Promise<void> => {
  const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
  await bakClient.post(`/batch/kandidat/${idKandidat}/verifikasi`, data, { headers });
};

export const bulkVerifikasiKandidat = async (data: {
  id_kandidat: string[];
  hasil: 'dikonfirmasi' | 'dikeluarkan';
  alasan_exclude?: string;
  alasan_exclude_lainnya?: string;
}): Promise<{ sukses: number; gagal: number; errors: string[] }> => {
  const response = await bakClient.post<ApiResponse<{ sukses: number; gagal: number; errors: string[] }>>(
    `/batch/kandidat/bulk-verifikasi`,
    data
  );
  return response.data.data;
};

export const bulkResetKandidat = async (idKandidat: string[]): Promise<{ sukses: number; gagal: number; errors: string[] }> => {
  const response = await bakClient.post<ApiResponse<{ sukses: number; gagal: number; errors: string[] }>>(
    `/batch/kandidat/bulk-reset`,
    { id_kandidat: idKandidat }
  );
  return response.data.data;
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

export const getMonitoringStats = async (): Promise<{
  total_aktif: number; total_lulus: number; persen_tepat_waktu: number; rata_masa_studi: number;
}> => {
  const response = await bakClient.get<ApiResponse<{
    total_aktif: number; total_lulus: number; persen_tepat_waktu: number; rata_masa_studi: number;
  }>>('/monitoring/stats');
  return response.data.data;
};

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

// ============ Notifikasi ============

// Batch: Kirim Email/WA manual per kandidat
export const sendEmailKandidat = async (idKandidat: string): Promise<{ email: string }> => {
  const response = await bakClient.post(`/batch/kandidat/${idKandidat}/send-email`);
  return response.data.data;
};

export const getWhatsAppLinkKandidat = async (idKandidat: string): Promise<{ telepon: string; wa_url: string; pesan: string }> => {
  const response = await bakClient.get(`/batch/kandidat/${idKandidat}/wa-link`);
  return response.data.data;
};

// SMTP Config CRUD
export const getSmtpList = async (): Promise<Record<string, unknown>[]> => {
  const response = await bakClient.get('/notifikasi/smtp');
  return response.data.data ?? [];
};

export const createSmtp = async (data: Record<string, unknown>): Promise<void> => {
  await bakClient.post('/notifikasi/smtp', data);
};

export const updateSmtp = async (id: string, data: Record<string, unknown>): Promise<void> => {
  await bakClient.put(`/notifikasi/smtp/${id}`, data);
};

export const deleteSmtp = async (id: string): Promise<void> => {
  await bakClient.delete(`/notifikasi/smtp/${id}`);
};

export const testSmtp = async (id: string, email: string): Promise<{ message: string }> => {
  const response = await bakClient.post(`/notifikasi/smtp/${id}/test`, { email });
  return response.data;
};

export const getNotifSettings = async (): Promise<Record<string, unknown>[]> => {
  const response = await bakClient.get('/notifikasi/settings');
  return response.data.data ?? [];
};

export const updateNotifSettings = async (settings: Array<{ kode: string; nilai: string }>): Promise<void> => {
  await bakClient.put('/notifikasi/settings', { settings });
};

export const testNotifEmail = async (email: string): Promise<{ message: string }> => {
  const response = await bakClient.post('/notifikasi/test-email', { email });
  return response.data;
};

export const getNotifTemplates = async (): Promise<Record<string, unknown>[]> => {
  const response = await bakClient.get('/notifikasi/templates');
  return response.data.data ?? [];
};

export const updateNotifTemplate = async (id: string, data: Record<string, unknown>): Promise<void> => {
  await bakClient.put(`/notifikasi/templates/${id}`, data);
};

export const previewNotifTemplate = async (id: string): Promise<{ subject: string; body_email: string; body_whatsapp: string }> => {
  const response = await bakClient.get(`/notifikasi/templates/${id}/preview`);
  return response.data.data;
};

export const getNotifLogs = async (params?: { page?: number; limit?: number; status?: string; channel?: string; kode_event?: string }): Promise<{ data: Record<string, unknown>[]; pagination: { total: number } }> => {
  const response = await bakClient.get('/notifikasi/logs', { params });
  return response.data;
};

export const getNotifLogStats = async (): Promise<{ total: number; sent: number; failed: number; pending: number }> => {
  const response = await bakClient.get('/notifikasi/logs/stats');
  return response.data.data;
};

// ============ KTW Exclusion ============

export const getKtwExclusions = async (): Promise<{
  exclusions: Array<{ id_exclude: string; jalur_pendaftaran: string; deskripsi: string | null; a_aktif: boolean; created_at: string }>;
  available_jalur: string[];
}> => {
  const response = await bakClient.get('/monitoring/ktw-exclusions');
  return response.data.data;
};

export const addKtwExclusion = async (jalur_pendaftaran: string, deskripsi?: string): Promise<void> => {
  await bakClient.post('/monitoring/ktw-exclusions', { jalur_pendaftaran, deskripsi });
};

export const toggleKtwExclusion = async (id: string, a_aktif: boolean): Promise<void> => {
  await bakClient.put(`/monitoring/ktw-exclusions/${id}`, { a_aktif });
};

export const deleteKtwExclusion = async (id: string): Promise<void> => {
  await bakClient.delete(`/monitoring/ktw-exclusions/${id}`);
};

// ============ Kategori Cuti ============

export const getKategoriCutiActive = async (): Promise<KategoriCuti[]> => {
  const response = await bakClient.get<ApiResponse<KategoriCuti[]>>('/layanan/referensi/kategori-cuti');
  return response.data.data;
};

export const getKategoriCuti = async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: KategoriCuti[]; pagination: { total: number } }> => {
  const response = await bakClient.get<PaginatedResponse<KategoriCuti>>('/master-data/kategori-cuti', { params });
  return { data: response.data.data, pagination: response.data.pagination };
};

export const createKategoriCuti = async (data: { id_kategori_cuti: string; nm_kategori: string; deskripsi?: string; a_aktif?: boolean; urutan?: number }): Promise<KategoriCuti> => {
  const response = await bakClient.post<ApiResponse<KategoriCuti>>('/master-data/kategori-cuti', data);
  return response.data.data;
};

export const updateKategoriCuti = async (id: string, data: { nm_kategori: string; deskripsi?: string; a_aktif?: boolean; urutan?: number }): Promise<KategoriCuti> => {
  const response = await bakClient.put<ApiResponse<KategoriCuti>>(`/master-data/kategori-cuti/${id}`, data);
  return response.data.data;
};

export const deleteKategoriCuti = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/kategori-cuti/${id}`);
};

// ============ Kategori Undur Diri ============

export const getKategoriUndurActive = async (): Promise<KategoriUndur[]> => {
  const response = await bakClient.get<ApiResponse<KategoriUndur[]>>('/layanan/referensi/kategori-undur');
  return response.data.data;
};

export const getKategoriUndur = async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: KategoriUndur[]; pagination: { total: number } }> => {
  const response = await bakClient.get<PaginatedResponse<KategoriUndur>>('/master-data/kategori-undur', { params });
  return { data: response.data.data, pagination: response.data.pagination };
};

export const createKategoriUndur = async (data: { id_kategori_undur: string; nm_kategori: string; deskripsi?: string; a_aktif?: boolean; urutan?: number }): Promise<KategoriUndur> => {
  const response = await bakClient.post<ApiResponse<KategoriUndur>>('/master-data/kategori-undur', data);
  return response.data.data;
};

export const updateKategoriUndur = async (id: string, data: { nm_kategori: string; deskripsi?: string; a_aktif?: boolean; urutan?: number }): Promise<KategoriUndur> => {
  const response = await bakClient.put<ApiResponse<KategoriUndur>>(`/master-data/kategori-undur/${id}`, data);
  return response.data.data;
};

export const deleteKategoriUndur = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/kategori-undur/${id}`);
};

// ============ Ketentuan Layanan (Akademik) ============

export const getKetentuanByLayanan = async (idJenisLayanan: string): Promise<KetentuanByLayananResponse> => {
  const response = await bakClient.get<ApiResponse<KetentuanByLayananResponse>>(`/layanan/referensi/ketentuan/${idJenisLayanan}`);
  return response.data.data;
};

export const getKetentuan = async (params?: { page?: number; limit?: number; search?: string; id_jenis_layanan?: string }): Promise<{ data: KetentuanLayanan[]; pagination: { total: number } }> => {
  const response = await bakClient.get<PaginatedResponse<KetentuanLayanan>>('/master-data/ketentuan-layanan', { params });
  return { data: response.data.data, pagination: response.data.pagination };
};

export const createKetentuan = async (data: Partial<KetentuanLayanan>): Promise<KetentuanLayanan> => {
  const response = await bakClient.post<ApiResponse<KetentuanLayanan>>('/master-data/ketentuan-layanan', data);
  return response.data.data;
};

export const updateKetentuan = async (id: string, data: Partial<KetentuanLayanan>): Promise<KetentuanLayanan> => {
  const response = await bakClient.put<ApiResponse<KetentuanLayanan>>(`/master-data/ketentuan-layanan/${id}`, data);
  return response.data.data;
};

export const deleteKetentuan = async (id: string): Promise<void> => {
  await bakClient.delete(`/master-data/ketentuan-layanan/${id}`);
};

// ============ Default Export ============

const simBakService = {
  // Public
  getJenisLayananPublic,
  // Master Data
  getJenisLayanan, getJenisLayananById, createJenisLayanan, updateJenisLayanan, deleteJenisLayanan,
  getPersyaratanByLayanan, getTahapanByLayanan,
  getPersyaratan, createPersyaratan, updatePersyaratan, deletePersyaratan,
  getKategoriCutiActive, getKategoriCuti, createKategoriCuti, updateKategoriCuti, deleteKategoriCuti,
  getKategoriUndurActive, getKategoriUndur, createKategoriUndur, updateKategoriUndur, deleteKategoriUndur,
  getKetentuanByLayanan, getKetentuan, createKetentuan, updateKetentuan, deleteKetentuan,
  getTahapan, createTahapan, updateTahapan, deleteTahapan,
  getTemplate, createTemplate, updateTemplate, deleteTemplate,
  // Profil & Workflow
  getMyProfile, getWorkflowProgress,
  // Referensi PDUT
  getRefFakultas, getRefProdi, getRefSemester, terimaTujuanAlihProgram,
  // Pengajuan
  getMyPengajuan, getMyStats, createPengajuan, createPengajuanEksternal, getPengajuanDetail, cekKrsPengajuan, getRiwayatCutiPengajuan,
  uploadDokumen, ajukanPengajuan, deleteDokumen,
  downloadDokumenUrl, downloadDokumenHasilUrl,
  // Admin
  getAdminPengajuan, getVerifikasiQueue, verifikasiPengajuan, mintaPerbaikan, terbitkanPengajuan, getWhatsAppLinkPengajuan,
  // Approval
  getApprovalQueue, approvePengajuan, rejectPengajuan,
  // Batch
  getBatchList, createBatch, getBatchDetail, getBatchKandidat, verifikasiKandidat, bulkVerifikasiKandidat, bulkResetKandidat, finalizeBatch,
  previewBatchCandidates, pullBatchCandidates, sendBatchToFakultas, uploadSkDekan, finalizeBatchWithSK, deleteBatch,
  // Dashboard
  getDashboardOverview, getDashboardSla, getDashboardTrends, getDashboardActivity,
  // Monitoring
  getMonitoringStats, getMahasiswaAktif, getLulusan, exportMonitoring,
  // Notifikasi
  getNotifSettings, updateNotifSettings, testNotifEmail,
  getNotifTemplates, updateNotifTemplate, previewNotifTemplate,
  getNotifLogs, getNotifLogStats,
};

export default simBakService;
