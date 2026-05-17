"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Chip } from "@heroui/react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader, FiDownload, FiFileText, FiUpload } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import {
  getTemplateBlankoList, uploadTemplateBlanko, updateTemplateBlanko, deleteTemplateBlanko, downloadTemplateBlanko,
  getJenisLayananPublic,
} from "@/lib/services/sim-bak/simBakService";
import type { TemplateBlanko, JenisLayanan } from "@/lib/services/sim-bak/types";
import ConfirmDialog from "../../components/ConfirmDialog";

const formatBytes = (mime: string) => {
  if (mime.includes("wordprocessingml")) return "DOCX";
  if (mime === "application/msword") return "DOC";
  if (mime === "application/pdf") return "PDF";
  return mime.split("/").pop() || "FILE";
};

export default function TemplateBlankoTab() {
  const [items, setItems] = useState<TemplateBlanko[]>([]);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  // Form
  const [formIdJenis, setFormIdJenis] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formVersi, setFormVersi] = useState("1.0");
  const [formKeterangan, setFormKeterangan] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [formFile, setFormFile] = useState<File | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try { setItems(await getTemplateBlankoList(filterLayanan || undefined)); }
    catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, [filterLayanan]);

  useEffect(() => {
    getJenisLayananPublic().then(list => setLayananList(list.filter(l => l.kategori !== "monitoring"))).catch(() => {});
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const openAdd = () => {
    setEditId(null);
    setFormIdJenis(filterLayanan || (layananList[0]?.id_jenis_layanan ?? ""));
    setFormNama("");
    setFormVersi("1.0");
    setFormKeterangan("");
    setFormAktif(true);
    setFormFile(null);
    setShowPanel(true);
  };

  const openEdit = (item: TemplateBlanko) => {
    setEditId(item.id_template);
    setFormIdJenis(item.id_jenis_layanan);
    setFormNama(item.nm_template);
    setFormVersi(item.versi);
    setFormKeterangan(item.keterangan ?? "");
    setFormAktif(item.a_aktif);
    setFormFile(null);
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!formIdJenis) { toast.error("Pilih jenis layanan"); return; }
    if (!formNama.trim()) { toast.error("Nama template wajib diisi"); return; }
    if (!editId && !formFile) { toast.error("File template wajib diupload"); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nm_template", formNama);
      if (formVersi) fd.append("versi", formVersi);
      if (formKeterangan) fd.append("keterangan", formKeterangan);
      fd.append("a_aktif", formAktif ? "1" : "0");
      if (formFile) fd.append("file", formFile);

      if (editId) {
        await updateTemplateBlanko(editId, fd);
        toast.success("Template berhasil diperbarui");
      } else {
        fd.append("id_jenis_layanan", formIdJenis);
        await uploadTemplateBlanko(fd);
        toast.success("Template berhasil diupload");
      }
      setShowPanel(false);
      fetchList();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal menyimpan";
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTemplateBlanko(deleteId);
      toast.success("Template berhasil dihapus");
      setDeleteId("");
      fetchList();
    } catch { toast.error("Gagal menghapus"); }
  };

  const handleDownload = async (item: TemplateBlanko) => {
    try {
      const ext = item.tipe_file.includes("wordprocessingml") ? "docx" :
                  item.tipe_file === "application/msword" ? "doc" : "pdf";
      const safeName = item.nm_template.replace(/[^A-Za-z0-9_\-]/g, "_");
      await downloadTemplateBlanko(item.id_template, `${safeName}.${ext}`);
    } catch { toast.error("Gagal download"); }
  };

  void loading;

  return (
    <>
      <Toaster position="top-right" />
      <div className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Template blanko (Word/PDF) yang dapat di-download oleh mahasiswa untuk diisi (mis. Surat Pernyataan Orang Tua, Surat Permohonan).
          </p>
          <div className="flex gap-2">
            <select value={filterLayanan} onChange={e => setFilterLayanan(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
              <option value="">Semua Layanan</option>
              {layananList.map(l => <option key={l.id_jenis_layanan} value={l.id_jenis_layanan}>{l.kode_layanan} — {l.nm_layanan}</option>)}
            </select>
            <Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd}>
              Upload Template
            </Button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <FiFileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada template blanko</p>
            <p className="text-xs mt-1">Upload template Word/PDF yang akan diunduh mahasiswa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id_template} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <FiFileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{item.kode_layanan}</span>
                      <span className="font-semibold text-gray-900 dark:text-white truncate">{item.nm_template}</span>
                      <Chip size="sm" variant="flat" color="default">{formatBytes(item.tipe_file)}</Chip>
                      {!item.a_aktif && <Chip size="sm" color="default" variant="flat">Nonaktif</Chip>}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{item.nm_layanan} • versi {item.versi} {item.keterangan ? `• ${item.keterangan}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button size="sm" variant="flat" color="primary" isIconOnly title="Download" onPress={() => handleDownload(item)}>
                    <FiDownload className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="flat" isIconOnly title="Edit" onPress={() => openEdit(item)}>
                    <FiEdit2 className="w-4 h-4 text-gray-600" />
                  </Button>
                  <Button size="sm" variant="flat" color="danger" isIconOnly title="Hapus" onPress={() => setDeleteId(item.id_template)}>
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Side Panel: Add/Edit */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Template Blanko" : "Upload Template Blanko"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan *</label>
                <select value={formIdJenis} onChange={e => setFormIdJenis(e.target.value)} disabled={!!editId}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60">
                  <option value="">— Pilih —</option>
                  {layananList.map(l => <option key={l.id_jenis_layanan} value={l.id_jenis_layanan}>{l.kode_layanan} — {l.nm_layanan}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Template *</label>
                <input type="text" value={formNama} onChange={e => setFormNama(e.target.value)}
                  placeholder="cth: Surat Pernyataan Orang Tua"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versi</label>
                <input type="text" value={formVersi} onChange={e => setFormVersi(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                <textarea value={formKeterangan} onChange={e => setFormKeterangan(e.target.value)} rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Template {editId ? "(opsional — kosongkan untuk pertahankan file lama)" : "*"}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <input type="file" accept=".docx,.doc,.pdf" onChange={e => setFormFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-sm hover:file:bg-blue-100 file:cursor-pointer" />
                  {formFile && (
                    <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                      <FiUpload className="inline w-3 h-3 mr-1" />{formFile.name} ({Math.round(formFile.size / 1024)} KB)
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">Format: DOCX, DOC, atau PDF. Maks 10 MB.</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formAktif} onChange={e => setFormAktif(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm">Aktif (mahasiswa bisa unduh)</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t px-6 py-4 flex gap-3">
              <Button variant="flat" className="flex-1" onPress={() => setShowPanel(false)}>Batal</Button>
              <Button color="primary" className="flex-1" isLoading={saving} onPress={handleSave}>
                {saving && <FiLoader className="w-4 h-4 animate-spin" />}{editId ? "Perbarui" : "Upload"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} title="Hapus Template Blanko"
        message="Yakin menghapus template ini? File di server akan dihapus juga."
        confirmLabel="Hapus" confirmColor="danger"
        onConfirm={handleDelete} onCancel={() => setDeleteId("")} />
    </>
  );
}
