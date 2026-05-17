/**
 * Klaim Subdomain Service — admin moderation untuk subdomain claim history.
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export type KlaimStatus = "pending" | "auto_approved" | "manual_review" | "approved" | "rejected";

export interface KlaimEntry {
  id_klaim_subdomain: string;
  id_pengguna_pdut: string;
  id_tipe_role: string;
  subdomain_diminta: string;
  alasan_subdomain?: string;
  validasi_json: Record<string, unknown>;
  status: KlaimStatus;
  catatan_moderator?: string;
  id_moderator_pdut?: string;
  tgl_diputuskan?: string;
  created_at: string;
  updated_at: string;
  role_kode?: string;
}

export interface KlaimListResult extends APIList<KlaimEntry> {
  count_status: Record<KlaimStatus, number>;
}

export interface KlaimModerateInput {
  status: KlaimStatus;
  catatan?: string;
}

export const adminKlaimService = {
  async list(status?: KlaimStatus, limit = 50, offset = 0): Promise<KlaimListResult> {
    const { data } = await blogClient.get<APIEnvelope<KlaimListResult>>("/admin/klaim-subdomain/", {
      params: { status, limit, offset },
    });
    return data.data;
  },
  async moderate(id: string, input: KlaimModerateInput): Promise<void> {
    await blogClient.patch(`/admin/klaim-subdomain/${id}`, input);
  },
};
