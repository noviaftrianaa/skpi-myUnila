"use client";

import { useState, useMemo } from "react";
import { Chip, Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyPersyaratan, dummyJenisLayanan } from "@/lib/services/sim-bak/dummyData";
import type { PersyaratanLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { nm_persyaratan: "", kode_dokumen: "", tipe_file: "application/pdf", ukuran_maks_mb: 2, apakah_wajib: true, urutan: 1 };

export default function PersyaratanTab() {
  const [data, setData] = useState(dummyPersyaratan);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!filterLayanan) return data;
    return data.filter((d) => d.id_jenis_layanan === filterLayanan);
  }, [data, filterLayanan]);

  const getLayananName = (id: string) => dummyJenisLayanan.find((j) => j.id_jenis_layanan === id)?.nm_layanan || "-";

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: PersyaratanLayanan) => {
    setEditId(item.id_persyaratan);
    setForm({ nm_persyaratan: item.nm_persyaratan, kode_dokumen: item.kode_dokumen, tipe_file: item.tipe_file, ukuran_maks_mb: item.ukuran_maks_mb, apakah_wajib: item.apakah_wajib, urutan: item.urutan });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_persyaratan || !form.kode_dokumen) {
      toast.error("Nama dan Kode Dokumen wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_persyaratan === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Persyaratan berhasil diperbarui");
    } else {
      const newItem: PersyaratanLayanan = { id_persyaratan: `ps-${Date.now()}`, id_jenis_layanan: filterLayanan || "jl-001", ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Persyaratan berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_persyaratan !== id));
    toast.success("Persyaratan berhasil dihapus");
  };

  const columns: Column<PersyaratanLayanan>[] = [
    {
      key: "nm_persyaratan", label: "NAMA PERSYARATAN", sortable: true,
      render: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.nm_persyaratan}</span>,
    },
    {
      key: "kode_dokumen", label: "KODE DOKUMEN", width: "150px",
      render: (item) => <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.kode_dokumen}</span>,
    },
    {
      key: "layanan", label: "LAYANAN", width: "180px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{getLayananName(item.id_jenis_layanan)}</span>,
    },
    {
      key: "tipe_file", label: "TIPE FILE", width: "140px",
      render: (item) => <span className="text-xs text-gray-500 dark:text-gray-400">{item.tipe_file.split(",").map((t) => t.split("/")[1]).join(", ")}</span>,
    },
    {
      key: "ukuran_maks_mb", label: "MAX (MB)", width: "80px",
      render: (item) => <span className="text-sm">{item.ukuran_maks_mb}</span>,
    },
    {
      key: "apakah_wajib", label: "WAJIB", width: "80px",
      render: (item) => (
        <Chip size="sm" color={item.apakah_wajib ? "danger" : "default"} variant="flat">
          {item.apakah_wajib ? "Wajib" : "Opsional"}
        </Chip>
      ),
    },
    {
      key: "aksi", label: "AKSI", width: "100px",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id_persyaratan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable
        data={filtered}
        columns={columns}
        searchable
        searchPlaceholder="Cari persyaratan..."
        searchKeys={["nm_persyaratan", "kode_dokumen"]}
        defaultRowsPerPage={10}
        filterSlot={
          <select value={filterLayanan} onChange={(e) => setFilterLayanan(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Semua Layanan</option>
            {dummyJenisLayanan.filter((j) => j.kategori !== "monitoring").map((j) => (
              <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>
            ))}
          </select>
        }
        actionSlot={
          <Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">Tambah</Button>
        }
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Persyaratan *</label>
                <input type="text" value={form.nm_persyaratan} onChange={(e) => setForm({ ...form, nm_persyaratan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Dokumen *</label>
                <input type="text" value={form.kode_dokumen} onChange={(e) => setForm({ ...form, kode_dokumen: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe File</label>
                <input type="text" value={form.tipe_file} onChange={(e) => setForm({ ...form, tipe_file: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="application/pdf,image/jpeg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Size (MB)</label>
                  <input type="number" value={form.ukuran_maks_mb} onChange={(e) => setForm({ ...form, ukuran_maks_mb: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.apakah_wajib} onChange={(e) => setForm({ ...form, apakah_wajib: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Dokumen Wajib</span>
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
