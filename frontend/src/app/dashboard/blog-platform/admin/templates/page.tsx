"use client";

// Admin: Template Theme — curated preset themes.
// 1 default (a_default=TRUE via partial unique index), authors pick di Settings → Theme.

import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import {
  FiAlertCircle, FiCheckCircle, FiEdit2, FiExternalLink, FiLoader,
  FiPlus, FiStar, FiToggleLeft, FiToggleRight, FiTrash2, FiX,
} from "react-icons/fi";
import { useState } from "react";
import {
  useCreateTemplateTheme, useDeleteTemplateTheme, useSetDefaultTemplateTheme,
  useTemplateThemeList, useUpdateTemplateTheme,
} from "@/lib/services/blog-platform";
import type { TemplateTheme } from "@/lib/services/blog-platform";

export default function AdminTemplatesPage() {
  const { data: items, isLoading, error } = useTemplateThemeList();
  const createMut = useCreateTemplateTheme();
  const updateMut = useUpdateTemplateTheme();
  const setDefaultMut = useSetDefaultTemplateTheme();
  const deleteMut = useDeleteTemplateTheme();
  const [actingId, setActingId] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateTheme | null>(null);
  const [formNm, setFormNm] = useState("");
  const [formKode, setFormKode] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formPreviewURL, setFormPreviewURL] = useState("");
  const [formManifest, setFormManifest] = useState("{}");
  const [formVersi, setFormVersi] = useState("1.0.0");
  const [formAktif, setFormAktif] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setFormNm("");
    setFormKode("");
    setFormDeskripsi("");
    setFormPreviewURL("");
    setFormManifest('{\n  "warna_primer": "#0B5EA8",\n  "warna_sekunder": "#073864",\n  "layout": "default",\n  "font_judul": "default"\n}');
    setFormVersi("1.0.0");
    setFormAktif(true);
    setFormOpen(true);
  };

  const openEdit = (t: TemplateTheme) => {
    setEditing(t);
    setFormNm(t.nm_template);
    setFormKode(t.kode);
    setFormDeskripsi(t.deskripsi || "");
    setFormPreviewURL(t.preview_url || "");
    setFormManifest(JSON.stringify(t.manifest_json || {}, null, 2));
    setFormVersi(t.versi);
    setFormAktif(t.a_aktif);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let manifest: Record<string, unknown> = {};
    try {
      manifest = JSON.parse(formManifest);
    } catch {
      alert("Manifest harus valid JSON.");
      return;
    }
    const input = {
      nm_template: formNm.trim(),
      kode: formKode.trim() || undefined,
      deskripsi: formDeskripsi.trim() || undefined,
      preview_url: formPreviewURL.trim() || undefined,
      manifest_json: manifest,
      versi: formVersi.trim() || "1.0.0",
      a_aktif: formAktif,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id_template_theme, input });
      } else {
        await createMut.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    }
  };

  const handleSetDefault = async (t: TemplateTheme) => {
    if (t.a_default) return;
    setActingId(t.id_template_theme);
    try {
      await setDefaultMut.mutateAsync(t.id_template_theme);
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleDelete = async (t: TemplateTheme) => {
    if (t.a_default) {
      alert("Set template lain sebagai default dulu, baru bisa hapus yang ini.");
      return;
    }
    if (!confirm(`Hapus template "${t.nm_template}"?\n\nBlog yang pakai template ini akan fallback ke default.`)) return;
    setActingId(t.id_template_theme);
    try {
      await deleteMut.mutateAsync(t.id_template_theme);
    } catch (err) {
      alert(`Gagal hapus: ${(err as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const handleToggleAktif = async (t: TemplateTheme) => {
    if (t.a_default && t.a_aktif) {
      alert("Tidak bisa nonaktifkan template default. Set default lain dulu.");
      return;
    }
    setActingId(t.id_template_theme);
    try {
      await updateMut.mutateAsync({
        id: t.id_template_theme,
        input: {
          nm_template: t.nm_template,
          kode: t.kode,
          deskripsi: t.deskripsi,
          preview_url: t.preview_url,
          manifest_json: t.manifest_json,
          versi: t.versi,
          a_aktif: !t.a_aktif,
        },
      });
    } catch (err) {
      alert(`Gagal: ${(err as Error).message}`);
    } finally {
      setActingId(null);
    }
  };

  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Konten</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Templates Theme</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Preset theme yang author bisa pilih di <span className="font-mono text-myunila">Settings → Theme</span>.
            Default theme dipakai blog tanpa pilihan eksplisit.
            {isLoading && <span className="ml-2 inline-flex items-center gap-1 text-myunila"><FiLoader className="w-3 h-3 animate-spin" /> Memuat…</span>}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-myunila text-white text-sm font-medium hover:bg-myunila-700"
        >
          <FiPlus className="w-4 h-4" /> Tambah Template
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-900 dark:text-rose-300">{(error as Error).message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items ?? []).map((t) => {
          const acting = actingId === t.id_template_theme;
          const manifest = t.manifest_json as { warna_primer?: string; warna_sekunder?: string; layout?: string };
          const primer = manifest?.warna_primer || "#0B5EA8";
          const sekunder = manifest?.warna_sekunder || "#073864";
          return (
            <Card key={t.id_template_theme} className={`shadow-sm border ${t.a_default ? "border-amber-300 ring-1 ring-amber-200 dark:border-amber-700 dark:ring-amber-900" : "border-slate-200/60 dark:border-slate-800"} ${!t.a_aktif ? "opacity-60" : ""}`}>
              <CardBody className="p-0 overflow-hidden">
                <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${primer} 0%, ${sekunder} 100%)` }}>
                  {t.preview_url && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={t.preview_url} alt={t.nm_template} className="w-full h-full object-cover" />
                  )}
                  {t.a_default && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider">
                      <FiStar className="w-3 h-3 fill-current" /> Default
                    </span>
                  )}
                  {!t.a_aktif && (
                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-semibold uppercase">
                      Nonaktif
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">{t.nm_template}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.kode} · v{t.versi}</p>
                  </div>
                  {t.deskripsi && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{t.deskripsi}</p>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: primer }} title="primer" />
                    <span className="w-4 h-4 rounded border border-slate-200 dark:border-slate-700" style={{ backgroundColor: sekunder }} title="sekunder" />
                    {manifest?.layout && (
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider ml-1">{manifest.layout}</span>
                    )}
                  </div>
                  <div className="pt-3 flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => handleSetDefault(t)} disabled={acting || t.a_default}
                      className={`text-[11px] px-2 py-1 rounded border inline-flex items-center gap-1 disabled:opacity-50 ${
                        t.a_default ? "border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/30 cursor-default"
                                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
                      <FiCheckCircle className="w-3 h-3" /> {t.a_default ? "Default" : "Set Default"}
                    </button>
                    <button onClick={() => handleToggleAktif(t)} disabled={acting}
                      className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 disabled:opacity-50">
                      {t.a_aktif ? <FiToggleRight className="w-3 h-3 text-emerald-500" /> : <FiToggleLeft className="w-3 h-3" />}
                      {t.a_aktif ? "Aktif" : "Nonaktif"}
                    </button>
                    <button onClick={() => openEdit(t)} disabled={acting}
                      className="text-[11px] px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 disabled:opacity-50">
                      <FiEdit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => handleDelete(t)} disabled={acting || t.a_default}
                      className="text-[11px] px-2 py-1 rounded border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title={t.a_default ? "Tidak bisa hapus template default" : "Hapus template"}>
                      <FiTrash2 className="w-3 h-3" /> Hapus
                    </button>
                    {acting && <FiLoader className="w-3 h-3 animate-spin text-myunila" />}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {!isLoading && (items?.length || 0) === 0 && (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            Belum ada template. Klik <strong>Tambah Template</strong> untuk buat preset pertama.
          </CardBody>
        </Card>
      )}

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={closeForm}>
          <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">
                {editing ? "Edit Template Theme" : "Tambah Template Theme"}
              </h3>
              <button type="button" onClick={closeForm} className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Nama Template *">
                  <input value={formNm} onChange={(e) => setFormNm(e.target.value)} required maxLength={120}
                    placeholder="mis. Magazine Pro"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm" />
                </FormField>
                <FormField label="Kode (slug)" hint="Auto-generate kalau kosong.">
                  <input value={formKode} onChange={(e) => setFormKode(e.target.value.toLowerCase())} maxLength={40}
                    placeholder="magazine-pro"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono" />
                </FormField>
              </div>
              <FormField label="Deskripsi">
                <textarea value={formDeskripsi} onChange={(e) => setFormDeskripsi(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm" />
              </FormField>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Preview URL" hint="Image preview.">
                  <input value={formPreviewURL} onChange={(e) => setFormPreviewURL(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono" />
                </FormField>
                <FormField label="Versi" hint="Semver.">
                  <input value={formVersi} onChange={(e) => setFormVersi(e.target.value)} maxLength={16}
                    placeholder="1.0.0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-mono" />
                </FormField>
                <FormField label="Status">
                  <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                    <input type="checkbox" checked={formAktif} onChange={(e) => setFormAktif(e.target.checked)} className="accent-myunila" />
                    <span className="text-sm">{formAktif ? "Aktif" : "Nonaktif"}</span>
                  </label>
                </FormField>
              </div>
              <FormField label="Manifest JSON" hint="warna_primer, warna_sekunder, layout, font_judul, dll.">
                <textarea value={formManifest} onChange={(e) => setFormManifest(e.target.value)} rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono" />
              </FormField>
            </div>
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              {editing && editing.preview_url && (
                <a href={editing.preview_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-myunila hover:underline inline-flex items-center gap-1">
                  <FiExternalLink className="w-3 h-3" /> Preview
                </a>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={closeForm} disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50">
                  Batal
                </button>
                <button type="submit" disabled={saving || !formNm.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila-700 disabled:opacity-50 inline-flex items-center gap-2">
                  {saving && <FiLoader className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="pt-2">
        <Link href="/dashboard/blog-platform" className="text-sm text-slate-500 hover:text-myunila inline-flex items-center gap-1">
          ← Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      {hint && <p className="text-[10px] text-slate-500 mb-1">{hint}</p>}
      {children}
    </div>
  );
}
