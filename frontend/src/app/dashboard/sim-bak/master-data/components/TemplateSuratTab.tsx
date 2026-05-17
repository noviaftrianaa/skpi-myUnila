"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Chip } from "@heroui/react";
import { FiEdit2, FiX, FiLoader, FiEye, FiRotateCcw, FiFileText } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import CKEditorClassic from "@/shared/components/ui/CKEditorClassic";
import {
  getTemplateSuratList, getTemplateSurat, updateTemplateSurat, resetTemplateSurat, previewTemplateSurat,
} from "@/lib/services/sim-bak/simBakService";
import type { TemplateSurat } from "@/lib/services/sim-bak/types";

const AVAILABLE_PLACEHOLDERS = [
  { key: "nm_mahasiswa", label: "Nama Mahasiswa" },
  { key: "nim", label: "NIM/NPM" },
  { key: "nm_prodi", label: "Program Studi" },
  { key: "nm_fakultas", label: "Fakultas" },
  { key: "angkatan", label: "Angkatan" },
  { key: "tahun_pkkmb", label: "Tahun PKKMB" },
  { key: "nomor_surat_polisi", label: "Nomor Surat Polisi (KTM/PKKMB)" },
  { key: "nomor_surat_ket_aktif", label: "Nomor Surat Keterangan Aktif" },
  { key: "nomor_sk_cuti", label: "Nomor SK Cuti (HERREG)" },
  { key: "tgl_sk_cuti", label: "Tanggal SK Cuti" },
  { key: "tgl_terbit", label: "Tanggal Terbit Surat" },
  { key: "tempat_terbit", label: "Tempat Terbit" },
];

export default function TemplateSuratTab() {
  const [items, setItems] = useState<TemplateSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TemplateSurat | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try { setItems(await getTemplateSuratList()); }
    catch { toast.error("Gagal memuat daftar template"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openEdit = async (item: TemplateSurat) => {
    try {
      const detail = await getTemplateSurat(item.id_template);
      setEditing(detail);
      setBodyHtml(detail.body_html ?? "");
    } catch { toast.error("Gagal memuat template"); }
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!bodyHtml.trim()) { toast.error("Konten template tidak boleh kosong"); return; }
    setSaving(true);
    try {
      await updateTemplateSurat(editing.id_template, { body_html: bodyHtml });
      toast.success("Template berhasil disimpan");
      setEditing(null);
      fetchList();
    } catch { toast.error("Gagal menyimpan template"); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!editing) return;
    if (!confirm("Reset template ke default? Perubahan akan hilang.")) return;
    try {
      await resetTemplateSurat(editing.id_template);
      const detail = await getTemplateSurat(editing.id_template);
      setBodyHtml(detail.body_html ?? "");
      toast.success("Template di-reset ke default");
      fetchList();
    } catch { toast.error("Gagal reset template"); }
  };

  const handlePreview = async () => {
    if (!editing) return;
    try {
      const { url } = await previewTemplateSurat(editing.id_template, bodyHtml);
      window.open(url, "_blank");
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal preview";
      toast.error(msg);
    }
  };

  const insertPlaceholder = (key: string) => {
    const tag = `{{${key}}}`;
    setBodyHtml((prev) => prev + " " + tag);
    navigator.clipboard?.writeText(tag).then(() => toast.success(`${tag} disalin & ditambahkan di akhir`)).catch(() => {});
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-5">
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Edit body draft surat keterangan. <strong>Layout (kop, judul, tanda tangan, footer) tetap di sistem.</strong> Pakai placeholder seperti <code>{"{{nm_mahasiswa}}"}</code> untuk data dinamis.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada template surat</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id_template} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                    <FiFileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{item.kode_layanan}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{item.nm_layanan}</span>
                      {item.is_modified && <Chip size="sm" color="warning" variant="flat">Dimodifikasi</Chip>}
                      {!item.a_aktif && <Chip size="sm" color="default" variant="flat">Nonaktif</Chip>}
                    </div>
                    <p className="text-xs text-gray-500">{item.nm_template} • versi {item.versi}</p>
                  </div>
                </div>
                <Button size="sm" variant="flat" color="primary" startContent={<FiEdit2 className="w-3.5 h-3.5" />}
                  onPress={() => openEdit(item)}>
                  Edit Template
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Edit Template */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Template: {editing.kode_layanan}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{editing.nm_layanan}</p>
              </div>
              <Button isIconOnly variant="light" size="sm" onPress={() => setEditing(null)}>
                <FiX className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-6">
              {/* Editor */}
              <div className="lg:col-span-3 space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Body Konten Surat</label>
                <CKEditorClassic value={bodyHtml} onChange={setBodyHtml} minHeight={400} />
                <p className="text-xs text-gray-500">
                  Tip: gunakan placeholder dari panel kanan. Layout induk (kop UNILA, tanda tangan) akan otomatis ditambahkan saat surat di-generate.
                </p>
              </div>

              {/* Placeholder picker */}
              <div className="lg:col-span-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Placeholder Tersedia</p>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {AVAILABLE_PLACEHOLDERS.map(p => (
                    <button key={p.key} type="button" onClick={() => insertPlaceholder(p.key)}
                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 border border-gray-200 dark:border-gray-700 transition-colors">
                      <code className="text-blue-600 dark:text-blue-400 font-mono">{`{{${p.key}}}`}</code>
                      <p className="text-gray-500 mt-0.5">{p.label}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Klik untuk tambah ke editor & copy ke clipboard.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-wrap gap-3 justify-between">
              <Button variant="flat" color="warning" startContent={<FiRotateCcw className="w-4 h-4" />} onPress={handleReset}>
                Reset ke Default
              </Button>
              <div className="flex gap-2">
                <Button variant="flat" startContent={<FiEye className="w-4 h-4" />} onPress={handlePreview}>
                  Preview PDF
                </Button>
                <Button variant="flat" onPress={() => setEditing(null)}>Batal</Button>
                <Button color="primary" isLoading={saving} onPress={handleSave}>
                  {saving && <FiLoader className="w-4 h-4 animate-spin" />}
                  Simpan
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
