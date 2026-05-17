/**
 * Template Theme Service — admin curate preset themes (ref.template_theme).
 * Authors pick one di Settings → Theme.
 */
import { blogClient, type APIEnvelope } from "./blogClient";

export interface TemplateTheme {
  id_template_theme: string;
  kode: string;
  nm_template: string;
  deskripsi?: string;
  preview_url?: string;
  manifest_json: Record<string, unknown>;
  versi: string;
  a_default: boolean;
  a_aktif: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertTemplateInput {
  kode?: string;
  nm_template: string;
  deskripsi?: string;
  preview_url?: string;
  manifest_json?: Record<string, unknown>;
  versi?: string;
  a_aktif?: boolean;
}

// Public list — aktif themes untuk author di Settings → Theme.
// Tidak butuh auth, baca dari /api/v1/template-theme (public route).
export const templateThemeService = {
  async listPublic(): Promise<TemplateTheme[]> {
    const { data } = await blogClient.get<APIEnvelope<TemplateTheme[]>>("/template-theme");
    return data.data;
  },
};

export const adminTemplateThemeService = {
  async list(): Promise<TemplateTheme[]> {
    const { data } = await blogClient.get<APIEnvelope<TemplateTheme[]>>("/admin/template-theme/");
    return data.data;
  },
  async create(input: UpsertTemplateInput): Promise<TemplateTheme> {
    const { data } = await blogClient.post<APIEnvelope<TemplateTheme>>("/admin/template-theme/", input);
    return data.data;
  },
  async update(id: string, input: UpsertTemplateInput): Promise<TemplateTheme> {
    const { data } = await blogClient.put<APIEnvelope<TemplateTheme>>(`/admin/template-theme/${id}`, input);
    return data.data;
  },
  async setDefault(id: string): Promise<void> {
    await blogClient.patch(`/admin/template-theme/${id}/set-default`);
  },
  async delete(id: string): Promise<void> {
    await blogClient.delete(`/admin/template-theme/${id}`);
  },
};
