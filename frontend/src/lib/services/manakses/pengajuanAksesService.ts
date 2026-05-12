import { authClient } from "@/lib/api/authClient";

export type StatusPengajuan = "pending" | "approved" | "rejected" | "cancelled" | "expired";

export interface AutoFlag {
  level: "warning" | "block";
  code: string;
  message: string;
}

export interface PengajuanAkses {
  id_pengajuan: string;
  status: StatusPengajuan;
  id_pengguna?: string;
  nama_pemohon?: string;
  nip_pemohon?: string;
  homebase_pemohon?: string;
  id_aplikasi: string;
  nm_aplikasi: string;
  id_peran: number;
  nm_peran: string;
  id_organisasi: string;
  nm_organisasi: string;
  sk_url?: string;
  sk_filename?: string;
  sk_filesize?: number;
  sk_mimetype?: string;
  no_sk?: string;
  tgl_sk?: string;
  tgl_kadaluarsa: string;
  catatan_pemohon?: string;
  catatan_validator?: string;
  alasan_tolak?: string;
  auto_flags: AutoFlag[];
  tgl_create: string;
  tgl_validasi?: string;
  nama_validator?: string;
}

export interface CreatePengajuanInput {
  id_aplikasi: string;
  id_peran: number;
  id_organisasi: string;
  sk_url: string;
  sk_filename: string;
  sk_filesize: number;
  sk_mimetype: string;
  no_sk?: string;
  tgl_sk?: string;
  tgl_kadaluarsa: string;
  catatan_pemohon?: string;
}

export interface UploadSkResult {
  sk_url: string;
  sk_filename: string;
  sk_filesize: number;
  sk_mimetype: string;
}

export interface QueueCount {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  expired: number;
  total: number;
}

const BASE = "/manakses/pengajuan-akses";

export const pengajuanAksesService = {
  /** Submit pengajuan baru. */
  async create(input: CreatePengajuanInput): Promise<PengajuanAkses> {
    const res = await authClient.post(`${BASE}`, input);
    return res.data.data;
  },

  /** List pengajuan saya (pemohon). */
  async myRequests(status?: StatusPengajuan): Promise<PengajuanAkses[]> {
    const res = await authClient.get(`${BASE}/my-requests`, {
      params: status ? { status } : undefined,
    });
    return res.data.data;
  },

  /** Get detail pengajuan (owner atau admin). */
  async show(id: string): Promise<PengajuanAkses> {
    const res = await authClient.get(`${BASE}/${id}`);
    return res.data.data;
  },

  /** Cancel pengajuan (only pending). */
  async cancel(id: string): Promise<void> {
    await authClient.put(`${BASE}/${id}/cancel`);
  },

  /** Upload SK file ke MinIO. Return key + metadata. */
  async uploadSk(file: File): Promise<UploadSkResult> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await authClient.post(`${BASE}/upload-sk`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  /** Preview SK file URL (return raw URL utk <iframe> atau <img>). */
  previewSkUrl(id: string): string {
    const baseURL = authClient.defaults.baseURL || "";
    return `${baseURL}${BASE}/preview-sk/${id}`;
  },

  // ── Admin endpoints ──

  /** List pengajuan (admin only, filter status). */
  async index(params: {
    status?: StatusPengajuan | "all";
    id_aplikasi?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: PengajuanAkses[]; pagination: { total: number; page: number; limit: number; total_pages: number } }> {
    const res = await authClient.get(`${BASE}`, { params });
    return { data: res.data.data, pagination: res.data.pagination };
  },

  /** Counter badge by status. */
  async queueCount(): Promise<QueueCount> {
    const res = await authClient.get(`${BASE}/queue/count`);
    return res.data.data;
  },

  /** Admin approve + auto-execute (insert role_pengguna + notif). */
  async approve(id: string, catatan_validator?: string): Promise<{ id_role_pengguna: string }> {
    const res = await authClient.put(`${BASE}/${id}/approve`, { catatan_validator });
    return res.data.data;
  },

  /** Admin reject dengan alasan. */
  async reject(id: string, alasan_tolak: string): Promise<void> {
    await authClient.put(`${BASE}/${id}/reject`, { alasan_tolak });
  },
};

export default pengajuanAksesService;
