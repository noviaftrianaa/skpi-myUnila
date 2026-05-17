/**
 * Admin Audit Log — cross-user activity timeline (audit.jejak_audit).
 * Backend: /admin/audit dengan filter aksi / entitas / id_user / pagination.
 */
import { blogClient, type APIEnvelope, type APIList } from "./blogClient";

export interface AuditEntry {
  id_jejak_audit: string;
  id_pengguna_pdut?: string;
  aksi: string;       // mis. 'create_post', 'curate_post', 'update_blog_profile'
  entitas: string;    // 'post' | 'blog' | 'tag' | 'kategori' | ...
  id_entitas?: string;
  detail_json: Record<string, unknown>;
  created_at: string;
}

export interface AuditListResult extends APIList<AuditEntry> {
  count_aksi: Record<string, number>;  // 30-day aggregate
}

export interface AuditListParams {
  aksi?: string;
  entitas?: string;
  id_user?: string;
  id_entitas?: string;
  limit?: number;
  offset?: number;
}

export const adminAuditService = {
  async list(params: AuditListParams = {}): Promise<AuditListResult> {
    const { data } = await blogClient.get<APIEnvelope<AuditListResult>>("/admin/audit", {
      params: {
        aksi: params.aksi,
        entitas: params.entitas,
        id_user: params.id_user,
        id_entitas: params.id_entitas,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
      },
    });
    return data.data;
  },
};
