"use client";

import { useState, useMemo } from "react";
import { Chip, Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyTemplate, dummyJenisLayanan } from "@/lib/services/sim-bak/dummyData";
import type { TemplateDokumen } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiDownload, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { nm_template: "", jenis_output: "PDF", versi: "1.0", apakah_aktif: true, id_jenis_layanan: "" };

export default function TemplateTab() {
  const [data, setData] = useState(dummyTemplate);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const getLayananName = (id: string) => dummyJenisLayanan.find((j) => j.id_jenis_layanan === id)?.nm_layanan || "-";

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowPanel(true); };
  const openEdit = (item: TemplateDokumen) => {
    setEditId(item.id_template);
    setForm({ nm_template: item.nm_template, jenis_output: item.jenis_output, versi: item.versi, apakah_aktif: item.apakah_aktif, id_jenis_layanan: item.id_jenis_layanan });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_template) { toast.error("Nama template wajib diisi"); return; }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_template === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Template berhasil diperbarui");
    } else {
      const newItem: TemplateDokumen = { id_template: `tp-${Date.now()}`, ...form, file_path: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Template berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => { setData((prev) => prev.filter((d) => d.id_template !== id)); toast.success("Template berhasil dihapus"); };

  const columns: Column<TemplateDokumen>[] = [
    { key: "nm_template", label: "NAMA TEMPLATE", sortable: true, render: (item) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{item.nm_template}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{getLayananName(item.id_jenis_layanan)}</p>
      </div>
    )},
    { key: "jenis_output", label: "OUTPUT", width: "80px", render: (item) => (
      <span className="inline-flex px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">{item.jenis_output}</span>
    )},
    { key: "versi", label: "VERSI", width: "80px", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">v{item.versi}</span> },
    { key: "apakah_aktif", label: "STATUS", width: "100px", render: (item) => (
      <Chip size="sm" color={item.apakah_aktif ? "success" : "default"} variant="flat">{item.apakah_aktif ? "Aktif" : "Nonaktif"}</Chip>
    )},
    { key: "file_path", label: "FILE", width: "120px", render: (item) => (
      item.file_path ? (
        <button className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline" onClick={() => toast.success("Download template (demo)")}>
          <FiDownload className="w-3 h-3" /> Download
        </button>
      ) : (
        <button className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline" onClick={() => toast("Upload file template (demo)")}>
          <FiUpload className="w-3 h-3" /> Upload
        </button>
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan</label>
                <select value={form.id_jenis_layanan} onChange={(e) => setForm({ ...form, id_jenis_layanan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Layanan</option>
                  {dummyJenisLayanan.map((j) => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Output</label>
                  <select value={form.jenis_output} onChange={(e) => setForm({ ...form, jenis_output: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Versi</label>
                  <input type="text" value={form.versi} onChange={(e) => setForm({ ...form, versi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Drag & drop file template atau <button className="text-blue-600 hover:underline">pilih file</button></p>
                <p className="text-xs text-gray-400 mt-1">DOCX, DOC, PDF (max 10MB)</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.apakah_aktif} onChange={(e) => setForm({ ...form, apakah_aktif: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Template Aktif</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">{editId ? "Perbarui" : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
