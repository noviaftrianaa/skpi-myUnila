"use client";

import { useState, useEffect, useCallback } from "react";
import { Chip, Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getPersyaratan, createPersyaratan, updatePersyaratan, deletePersyaratan, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { PersyaratanLayanan, JenisLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { id_jenis_layanan: "", kode_dokumen: "", nm_dokumen: "", deskripsi: "", tipe_file: "application/pdf", max_size_mb: 5, a_wajib: true, urutan: 1 };

export default function PersyaratanTab() {
  const [data, setData] = useState<PersyaratanLayanan[]>([]);
  const [total, setTotal] = useState(0);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPersyaratan({ page, limit: 10, id_jenis_layanan: filterLayanan || undefined });
      setData(result.data);
      setTotal(result.pagination.total);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, [page, filterLayanan]);

  useEffect(() => {
    getJenisLayananPublic().then(setLayananList).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm, id_jenis_layanan: filterLayanan || "" }); setShowPanel(true); };
  const openEdit = (item: PersyaratanLayanan) => {
    setEditId(item.id_persyaratan);
    setForm({ id_jenis_layanan: item.id_jenis_layanan, kode_dokumen: item.kode_dokumen, nm_dokumen: item.nm_dokumen, deskripsi: item.deskripsi || "", tipe_file: item.tipe_file, max_size_mb: item.max_size_mb, a_wajib: item.a_wajib, urutan: item.urutan });
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!form.nm_dokumen || !form.kode_dokumen) { toast.error("Nama dan Kode Dokumen wajib diisi"); return; }
    setSaving(true);
    try {
      if (editId) { await updatePersyaratan(editId, form); toast.success("Persyaratan berhasil diperbarui"); }
      else { await createPersyaratan(form); toast.success("Persyaratan berhasil ditambahkan"); }
      setShowPanel(false); fetchData();
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus persyaratan ini?")) return;
    try { await deletePersyaratan(id); toast.success("Berhasil dihapus"); fetchData(); }
    catch { toast.error("Gagal menghapus"); }
  };

  const columns: Column<PersyaratanLayanan>[] = [
    { key: "nm_dokumen", label: "NAMA PERSYARATAN", sortable: true, render: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.nm_dokumen}</span> },
    { key: "kode_dokumen", label: "KODE", width: "150px", render: (item) => <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.kode_dokumen}</span> },
    { key: "nm_layanan", label: "LAYANAN", width: "180px", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.nm_layanan || "-"}</span> },
    { key: "tipe_file", label: "TIPE", width: "120px", render: (item) => <span className="text-xs text-gray-500">{item.tipe_file.split(",").map(t => t.split("/")[1]).join(", ")}</span> },
    { key: "max_size_mb", label: "MAX", width: "70px", render: (item) => <span className="text-sm">{item.max_size_mb}MB</span> },
    { key: "a_wajib", label: "WAJIB", width: "80px", render: (item) => <Chip size="sm" color={item.a_wajib ? "danger" : "default"} variant="flat">{item.a_wajib ? "Wajib" : "Opsional"}</Chip> },
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_persyaratan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={data} columns={columns} searchable searchPlaceholder="Cari persyaratan..." searchKeys={["nm_dokumen", "kode_dokumen"]} defaultRowsPerPage={10}
        filterSlot={
          <select value={filterLayanan} onChange={(e) => { setFilterLayanan(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Layanan</option>
            {layananList.filter(j => j.kategori !== "monitoring").map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
          </select>
        }
        actionSlot={<Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">Tambah</Button>}
      />

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Persyaratan" : "Tambah Persyaratan"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan *</label>
                <select value={form.id_jenis_layanan} onChange={(e) => setForm({ ...form, id_jenis_layanan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Layanan</option>
                  {layananList.filter(j => j.kategori !== "monitoring").map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Dokumen *</label>
                <input type="text" value={form.nm_dokumen} onChange={(e) => setForm({ ...form, nm_dokumen: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Dokumen *</label>
                <input type="text" value={form.kode_dokumen} onChange={(e) => setForm({ ...form, kode_dokumen: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="DOC-SURAT-PERMOHONAN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe File</label>
                <input type="text" value={form.tipe_file} onChange={(e) => setForm({ ...form, tipe_file: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="application/pdf" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Size (MB)</label>
                  <input type="number" value={form.max_size_mb} onChange={(e) => setForm({ ...form, max_size_mb: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.a_wajib} onChange={(e) => setForm({ ...form, a_wajib: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dokumen Wajib</span>
              </label>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <FiLoader className="w-4 h-4 animate-spin" />}{editId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
