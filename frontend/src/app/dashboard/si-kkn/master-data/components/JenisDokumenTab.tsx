"use client";

import { useState } from "react";
import { Chip, Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyJenisDokumen } from "@/lib/services/si-kkn/dummyData";
import type { JenisDokumen } from "@/lib/services/si-kkn/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  kode_dokumen: "",
  nm_dokumen: "",
  deskripsi: "",
  tipe_file: "application/pdf",
  ukuran_maks_mb: 10,
  apakah_wajib: true,
  urutan: 1,
};

export default function JenisDokumenTab() {
  const [data, setData] = useState(dummyJenisDokumen);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: JenisDokumen) => {
    setEditId(item.id_jenis_dokumen);
    setForm({
      kode_dokumen: item.kode_dokumen,
      nm_dokumen: item.nm_dokumen,
      deskripsi: item.deskripsi || "",
      tipe_file: item.tipe_file,
      ukuran_maks_mb: item.ukuran_maks_mb,
      apakah_wajib: item.apakah_wajib,
      urutan: item.urutan,
    });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.kode_dokumen || !form.nm_dokumen) {
      toast.error("Kode dan Nama Dokumen wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_jenis_dokumen === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Jenis dokumen berhasil diperbarui");
    } else {
      const newItem: JenisDokumen = { id_jenis_dokumen: `jd-${Date.now()}`, ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Jenis dokumen berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_jenis_dokumen !== id));
    toast.success("Jenis dokumen berhasil dihapus");
  };

  const columns: Column<JenisDokumen>[] = [
    {
      key: "kode_dokumen", label: "KODE", width: "140px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.kode_dokumen}</span>,
    },
    {
      key: "nm_dokumen", label: "NAMA DOKUMEN", sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.nm_dokumen}</p>
          {item.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>}
        </div>
      ),
    },
    {
      key: "tipe_file", label: "TIPE FILE", width: "180px",
      render: (item) => <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{item.tipe_file}</span>,
    },
    {
      key: "ukuran_maks_mb", label: "MAX SIZE", width: "100px", sortable: true,
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.ukuran_maks_mb} MB</span>,
    },
    {
      key: "apakah_wajib", label: "WAJIB", width: "100px",
      render: (item) => (
        <Chip size="sm" color={item.apakah_wajib ? "danger" : "default"} variant="flat">
          {item.apakah_wajib ? "Wajib" : "Opsional"}
        </Chip>
      ),
    },
    {
      key: "urutan", label: "URUTAN", width: "80px", sortable: true,
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.urutan}</span>,
    },
    {
      key: "aksi", label: "AKSI", width: "100px",
      render: (item) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors" title="Edit">
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(item.id_jenis_dokumen)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
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
        searchPlaceholder="Cari jenis dokumen..."
        searchKeys={["kode_dokumen", "nm_dokumen"]}
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
                {editId ? "Edit Jenis Dokumen" : "Tambah Jenis Dokumen"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Dokumen *</label>
                <input type="text" value={form.kode_dokumen} onChange={(e) => setForm({ ...form, kode_dokumen: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: PROPOSAL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Dokumen *</label>
                <input type="text" value={form.nm_dokumen} onChange={(e) => setForm({ ...form, nm_dokumen: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: Proposal Program Kerja" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi dokumen..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipe File</label>
                <input type="text" value={form.tipe_file} onChange={(e) => setForm({ ...form, tipe_file: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: application/pdf" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Size (MB)</label>
                  <input type="number" value={form.ukuran_maks_mb} onChange={(e) => setForm({ ...form, ukuran_maks_mb: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wajib</label>
                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                  <input type="checkbox" checked={form.apakah_wajib} onChange={(e) => setForm({ ...form, apakah_wajib: e.target.checked })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Wajib diupload</span>
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
