"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyWilayahKkn } from "@/lib/services/si-kkn/dummyData";
import type { WilayahKkn } from "@/lib/services/si-kkn/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  nm_wilayah: "",
  nm_kabupaten: "",
  provinsi: "Lampung",
  deskripsi: "",
  apakah_aktif: true,
};

export default function WilayahTab() {
  const [data, setData] = useState(dummyWilayahKkn);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: WilayahKkn) => {
    setEditId(item.id_wilayah);
    setForm({
      nm_wilayah: item.nm_wilayah,
      nm_kabupaten: item.nm_kabupaten,
      provinsi: item.provinsi,
      deskripsi: item.deskripsi || "",
      apakah_aktif: item.apakah_aktif,
    });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_wilayah || !form.nm_kabupaten) {
      toast.error("Nama Wilayah dan Kabupaten wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_wilayah === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Wilayah berhasil diperbarui");
    } else {
      const newItem: WilayahKkn = { id_wilayah: `wil-${Date.now()}`, ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Wilayah berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_wilayah !== id));
    toast.success("Wilayah berhasil dihapus");
  };

  const columns: Column<WilayahKkn>[] = [
    {
      key: "id_wilayah", label: "KODE", width: "100px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.id_wilayah}</span>,
    },
    {
      key: "nm_wilayah", label: "NAMA WILAYAH", sortable: true,
      render: (item) => <p className="font-medium text-gray-900 dark:text-white">{item.nm_wilayah}</p>,
    },
    {
      key: "nm_kabupaten", label: "KABUPATEN", width: "180px", sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_kabupaten}</span>,
    },
    {
      key: "provinsi", label: "PROVINSI", width: "120px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.provinsi}</span>,
    },
    {
      key: "deskripsi", label: "DESKRIPSI",
      render: (item) => <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{item.deskripsi || "-"}</span>,
    },
    {
      key: "apakah_aktif", label: "STATUS", width: "100px",
      render: (item) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${item.apakah_aktif ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
          {item.apakah_aktif ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
    {
      key: "aksi", label: "AKSI", width: "100px",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors" title="Edit">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id_wilayah)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
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
        data={data}
        columns={columns}
        searchable
        searchPlaceholder="Cari wilayah..."
        searchKeys={["nm_wilayah", "nm_kabupaten"]}
        defaultRowsPerPage={10}
        actionSlot={
          <Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">
            Tambah
          </Button>
        }
      />

      {/* Slide-over Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editId ? "Edit Wilayah" : "Tambah Wilayah"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Wilayah *</label>
                <input type="text" value={form.nm_wilayah} onChange={(e) => setForm({ ...form, nm_wilayah: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: Wilayah Lampung Selatan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kabupaten *</label>
                  <input type="text" value={form.nm_kabupaten} onChange={(e) => setForm({ ...form, nm_kabupaten: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cth: Lampung Selatan" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provinsi</label>
                  <input type="text" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi wilayah..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input type="checkbox" checked={form.apakah_aktif} onChange={(e) => setForm({ ...form, apakah_aktif: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                {editId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
