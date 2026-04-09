"use client";

import { useState, useEffect, useCallback } from "react";
import { Chip, Button } from "@heroui/react";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getTemplate, createTemplate, updateTemplate, deleteTemplate, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { TemplateDokumen, JenisLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiDownload, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { id_jenis_layanan: "", nm_template: "", versi: "1.0", path_file: "", tipe_file: "application/pdf", a_aktif: true, keterangan: "" };

export default function TemplateTab() {
  const [data, setData] = useState<TemplateDokumen[]>([]);
  const [total, setTotal] = useState(0);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const result = await getTemplate({ page, limit: 10 });
      setData(result.data);
      setTotal(result.pagination.total);
    } catch { toast.error("Gagal memuat data"); }
  }, [page]);

  useEffect(() => { getJenisLayananPublic().then(setLayananList).catch(() => {}); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowPanel(true); };
  const openEdit = (item: TemplateDokumen) => {
    setEditId(item.id_template);
    setForm({ id_jenis_layanan: item.id_jenis_layanan, nm_template: item.nm_template, versi: item.versi, path_file: item.path_file || "", tipe_file: item.tipe_file, a_aktif: item.a_aktif, keterangan: item.keterangan || "" });
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!form.nm_template) { toast.error("Nama template wajib diisi"); return; }
    setSaving(true);
    try {
      if (editId) { await updateTemplate(editId, form); toast.success("Berhasil diperbarui"); }
      else { await createTemplate(form); toast.success("Berhasil ditambahkan"); }
      setShowPanel(false); fetchData();
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const executeDelete = async () => {
    try { await deleteTemplate(deleteConfirmId); toast.success("Berhasil dihapus"); setDeleteConfirmId(""); fetchData(); } catch { toast.error("Gagal menghapus"); }
  };

  const columns: Column<TemplateDokumen>[] = [
    { key: "nm_template", label: "NAMA TEMPLATE", sortable: true, render: (item) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{item.nm_template}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.nm_layanan || "-"}</p>
      </div>
    )},
    { key: "tipe_file", label: "TIPE", width: "100px", render: (item) => (
      <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
        {item.tipe_file.split("/").pop()?.toUpperCase() || "PDF"}
      </span>
    )},
    { key: "versi", label: "VERSI", width: "80px", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">v{item.versi}</span> },
    { key: "a_aktif", label: "STATUS", width: "100px", render: (item) => (
      <Chip size="sm" color={item.a_aktif ? "success" : "default"} variant="flat">{item.a_aktif ? "Aktif" : "Nonaktif"}</Chip>
    )},
    { key: "path_file", label: "FILE", width: "120px", render: (item) => (
      item.path_file ? (
        <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"><FiDownload className="w-3 h-3" /> Download</button>
      ) : (
        <button className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline"><FiUpload className="w-3 h-3" /> Upload</button>
      )
    )},
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_template)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={data} columns={columns} searchable searchPlaceholder="Cari template..." searchKeys={["nm_template"]} defaultRowsPerPage={10}
        actionSlot={<Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">Tambah</Button>}
      />

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Template" : "Tambah Template"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Template *</label>
                <input type="text" value={form.nm_template} onChange={(e) => setForm({ ...form, nm_template: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan</label>
                <select value={form.id_jenis_layanan} onChange={(e) => setForm({ ...form, id_jenis_layanan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Layanan</option>
                  {layananList.map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe File</label>
                  <select value={form.tipe_file} onChange={(e) => setForm({ ...form, tipe_file: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="application/pdf">PDF</option>
                    <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versi</label>
                  <input type="text" value={form.versi} onChange={(e) => setForm({ ...form, versi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                <textarea value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop file template atau <span className="text-blue-600 hover:underline cursor-pointer">pilih file</span></p>
                <p className="text-xs text-gray-400 mt-1">DOCX, DOC, PDF (max 10MB)</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.a_aktif} onChange={(e) => setForm({ ...form, a_aktif: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Template Aktif</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2.5 rounded-lg ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <FiLoader className="w-4 h-4 animate-spin" />}{editId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <ConfirmDialog open={!!deleteConfirmId} title="Hapus Template" message="Hapus template dokumen ini?" confirmLabel="Hapus" confirmColor="danger" onConfirm={executeDelete} onCancel={() => setDeleteConfirmId("")} />
    </>
  );
}
