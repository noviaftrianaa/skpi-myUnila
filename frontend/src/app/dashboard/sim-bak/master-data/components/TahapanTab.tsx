"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getTahapan, createTahapan, updateTahapan, deleteTahapan, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { TahapanLayanan, JenisLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { id_jenis_layanan: "", nm_tahapan: "", urutan: 1, kode_role: "", status_masuk: "", status_selesai: "", a_opsional: false, deskripsi: "" };

const roleColors: Record<string, string> = {
  mahasiswa: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  admin_bak: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  admin_fakultas: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  pejabat: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function TahapanTab() {
  const [data, setData] = useState<TahapanLayanan[]>([]);
  const [total, setTotal] = useState(0);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const result = await getTahapan({ page, limit: 20, id_jenis_layanan: filterLayanan || undefined });
      setData(result.data);
      setTotal(result.pagination.total);
    } catch { toast.error("Gagal memuat data"); }
  }, [page, filterLayanan]);

  useEffect(() => { getJenisLayananPublic().then(setLayananList).catch(() => {}); }, []);
  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm, id_jenis_layanan: filterLayanan || "" }); setShowPanel(true); };
  const openEdit = (item: TahapanLayanan) => {
    setEditId(item.id_tahapan);
    setForm({ id_jenis_layanan: item.id_jenis_layanan, nm_tahapan: item.nm_tahapan, urutan: item.urutan, kode_role: item.kode_role, status_masuk: item.status_masuk, status_selesai: item.status_selesai, a_opsional: item.a_opsional, deskripsi: item.deskripsi || "" });
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!form.nm_tahapan || !form.kode_role) { toast.error("Nama dan Role wajib diisi"); return; }
    setSaving(true);
    try {
      if (editId) { await updateTahapan(editId, form); toast.success("Berhasil diperbarui"); }
      else { await createTahapan(form); toast.success("Berhasil ditambahkan"); }
      setShowPanel(false); fetchData();
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const executeDelete = async () => {
    try { await deleteTahapan(deleteConfirmId); toast.success("Berhasil dihapus"); setDeleteConfirmId(""); fetchData(); } catch { toast.error("Gagal menghapus"); }
  };

  const columns: Column<TahapanLayanan>[] = [
    { key: "urutan", label: "#", width: "60px", sortable: true, render: (item) => (
      <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">{item.urutan}</span>
    )},
    { key: "nm_tahapan", label: "NAMA TAHAPAN", sortable: true, render: (item) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{item.nm_tahapan}</p>
        {item.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>}
      </div>
    )},
    { key: "nm_layanan", label: "LAYANAN", width: "180px", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.nm_layanan || "-"}</span> },
    { key: "kode_role", label: "ROLE", width: "140px", render: (item) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[item.kode_role] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
        {item.kode_role}
      </span>
    )},
    { key: "status_masuk", label: "FLOW", width: "200px", render: (item) => (
      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{item.status_masuk} → {item.status_selesai}</span>
    )},
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_tahapan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={data} columns={columns} searchable searchPlaceholder="Cari tahapan..." searchKeys={["nm_tahapan", "kode_role"]} defaultRowsPerPage={20}
        filterSlot={
          <select value={filterLayanan} onChange={(e) => { setFilterLayanan(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Tahapan" : "Tambah Tahapan"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan *</label>
                <select value={form.id_jenis_layanan} onChange={(e) => setForm({ ...form, id_jenis_layanan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Layanan</option>
                  {layananList.filter(j => j.kategori !== "monitoring").map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Tahapan *</label>
                <input type="text" value={form.nm_tahapan} onChange={(e) => setForm({ ...form, nm_tahapan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Penanggung Jawab *</label>
                <select value={form.kode_role} onChange={(e) => setForm({ ...form, kode_role: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Role</option>
                  <option value="mahasiswa">Mahasiswa</option>
                  <option value="admin_bak">Admin BAK</option>
                  <option value="admin_fakultas">Admin Fakultas</option>
                  <option value="pejabat">Pejabat</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Masuk</label>
                  <input type="text" value={form.status_masuk} onChange={(e) => setForm({ ...form, status_masuk: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="draft" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Selesai</label>
                  <input type="text" value={form.status_selesai} onChange={(e) => setForm({ ...form, status_selesai: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="diajukan" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
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
    <ConfirmDialog open={!!deleteConfirmId} title="Hapus Tahapan" message="Hapus tahapan workflow ini?" confirmLabel="Hapus" confirmColor="danger" onConfirm={executeDelete} onCancel={() => setDeleteConfirmId("")} />
    </>
  );
}
