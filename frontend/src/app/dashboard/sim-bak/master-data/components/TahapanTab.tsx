"use client";

import { useState, useMemo } from "react";
import { Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyTahapan, dummyJenisLayanan } from "@/lib/services/sim-bak/dummyData";
import type { TahapanLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { nm_tahapan: "", urutan: 1, role_penanggung_jawab: "", deskripsi: "" };

export default function TahapanTab() {
  const [data, setData] = useState(dummyTahapan);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!filterLayanan) return data;
    return data.filter((d) => d.id_jenis_layanan === filterLayanan);
  }, [data, filterLayanan]);

  const getLayananName = (id: string) => dummyJenisLayanan.find((j) => j.id_jenis_layanan === id)?.nm_layanan || "-";

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowPanel(true); };
  const openEdit = (item: TahapanLayanan) => {
    setEditId(item.id_tahapan);
    setForm({ nm_tahapan: item.nm_tahapan, urutan: item.urutan, role_penanggung_jawab: item.role_penanggung_jawab, deskripsi: item.deskripsi || "" });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_tahapan || !form.role_penanggung_jawab) { toast.error("Nama tahapan dan Role PJ wajib diisi"); return; }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_tahapan === editId ? { ...d, ...form, deskripsi: form.deskripsi || null, updated_at: new Date().toISOString() } : d));
      toast.success("Tahapan berhasil diperbarui");
    } else {
      const newItem: TahapanLayanan = { id_tahapan: `th-${Date.now()}`, id_jenis_layanan: filterLayanan || "jl-001", ...form, deskripsi: form.deskripsi || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Tahapan berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => { setData((prev) => prev.filter((d) => d.id_tahapan !== id)); toast.success("Tahapan berhasil dihapus"); };

  const roleColors: Record<string, string> = {
    "Mahasiswa": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Admin BAK": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Admin Fakultas": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    "Dekan": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    "Wakil Rektor": "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  };

  const columns: Column<TahapanLayanan>[] = [
    { key: "urutan", label: "#", width: "60px", sortable: true, render: (item) => (
      <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold">{item.urutan}</span>
    )},
    { key: "nm_tahapan", label: "NAMA TAHAPAN", sortable: true, render: (item) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{item.nm_tahapan}</p>
        {item.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.deskripsi}</p>}
      </div>
    )},
    { key: "layanan", label: "LAYANAN", width: "180px", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{getLayananName(item.id_jenis_layanan)}</span> },
    { key: "role_penanggung_jawab", label: "ROLE PJ", width: "160px", render: (item) => (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[item.role_penanggung_jawab] || "bg-gray-100 text-gray-600"}`}>
        {item.role_penanggung_jawab}
      </span>
    )},
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_tahapan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={filtered} columns={columns} searchable searchPlaceholder="Cari tahapan..." searchKeys={["nm_tahapan", "role_penanggung_jawab"]} defaultRowsPerPage={10}
        filterSlot={
          <select value={filterLayanan} onChange={(e) => setFilterLayanan(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Layanan</option>
            {dummyJenisLayanan.filter((j) => j.kategori !== "monitoring" && j.kategori !== "batch_administrasi").map((j) => (
              <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>
            ))}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Tahapan *</label>
                <input type="text" value={form.nm_tahapan} onChange={(e) => setForm({ ...form, nm_tahapan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Penanggung Jawab *</label>
                <select value={form.role_penanggung_jawab} onChange={(e) => setForm({ ...form, role_penanggung_jawab: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Role</option>
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Admin BAK">Admin BAK</option>
                  <option value="Admin Fakultas">Admin Fakultas</option>
                  <option value="Dekan">Dekan</option>
                  <option value="Wakil Rektor">Wakil Rektor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
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
