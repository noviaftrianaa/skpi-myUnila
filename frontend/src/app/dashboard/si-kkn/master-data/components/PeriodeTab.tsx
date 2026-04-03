"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyPeriodeKkn } from "@/lib/services/si-kkn/dummyData";
import type { PeriodeKkn } from "@/lib/services/si-kkn/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  nm_periode: "",
  tahun_akademik: "",
  semester: "genap" as PeriodeKkn["semester"],
  tgl_mulai_daftar: "",
  tgl_selesai_daftar: "",
  tgl_mulai_kkn: "",
  tgl_selesai_kkn: "",
  kuota_peserta: 500,
  apakah_aktif: true,
};

function formatDate(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PeriodeTab() {
  const [data, setData] = useState(dummyPeriodeKkn);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: PeriodeKkn) => {
    setEditId(item.id_periode);
    setForm({
      nm_periode: item.nm_periode,
      tahun_akademik: item.tahun_akademik,
      semester: item.semester,
      tgl_mulai_daftar: item.tgl_mulai_daftar.slice(0, 10),
      tgl_selesai_daftar: item.tgl_selesai_daftar.slice(0, 10),
      tgl_mulai_kkn: item.tgl_mulai_kkn.slice(0, 10),
      tgl_selesai_kkn: item.tgl_selesai_kkn.slice(0, 10),
      kuota_peserta: item.kuota_peserta,
      apakah_aktif: item.apakah_aktif,
    });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_periode || !form.tahun_akademik) {
      toast.error("Nama Periode dan Tahun Akademik wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_periode === editId ? { ...d, ...form, tgl_mulai_daftar: form.tgl_mulai_daftar + "T00:00:00Z", tgl_selesai_daftar: form.tgl_selesai_daftar + "T23:59:59Z", tgl_mulai_kkn: form.tgl_mulai_kkn + "T00:00:00Z", tgl_selesai_kkn: form.tgl_selesai_kkn + "T23:59:59Z", updated_at: new Date().toISOString() } : d));
      toast.success("Periode berhasil diperbarui");
    } else {
      const newItem: PeriodeKkn = { id_periode: `per-${Date.now()}`, ...form, tgl_mulai_daftar: form.tgl_mulai_daftar + "T00:00:00Z", tgl_selesai_daftar: form.tgl_selesai_daftar + "T23:59:59Z", tgl_mulai_kkn: form.tgl_mulai_kkn + "T00:00:00Z", tgl_selesai_kkn: form.tgl_selesai_kkn + "T23:59:59Z", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Periode berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_periode !== id));
    toast.success("Periode berhasil dihapus");
  };

  const columns: Column<PeriodeKkn>[] = [
    {
      key: "id_periode", label: "KODE", width: "100px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.id_periode}</span>,
    },
    {
      key: "nm_periode", label: "NAMA PERIODE", sortable: true,
      render: (item) => <p className="font-medium text-gray-900 dark:text-white">{item.nm_periode}</p>,
    },
    {
      key: "tahun_akademik", label: "TAHUN AKADEMIK", width: "140px", sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.tahun_akademik} ({item.semester})</span>,
    },
    {
      key: "tgl_mulai_daftar", label: "PENDAFTARAN", width: "200px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(item.tgl_mulai_daftar)} - {formatDate(item.tgl_selesai_daftar)}</span>,
    },
    {
      key: "tgl_mulai_kkn", label: "PELAKSANAAN", width: "200px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(item.tgl_mulai_kkn)} - {formatDate(item.tgl_selesai_kkn)}</span>,
    },
    {
      key: "kuota_peserta", label: "KUOTA", width: "80px", sortable: true,
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.kuota_peserta}</span>,
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
          <button onClick={() => handleDelete(item.id_periode)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
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
        searchPlaceholder="Cari periode..."
        searchKeys={["nm_periode", "tahun_akademik"]}
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
                {editId ? "Edit Periode" : "Tambah Periode"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Periode *</label>
                <input type="text" value={form.nm_periode} onChange={(e) => setForm({ ...form, nm_periode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: KKN Periode 1 Tahun 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tahun Akademik *</label>
                  <input type="text" value={form.tahun_akademik} onChange={(e) => setForm({ ...form, tahun_akademik: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cth: 2025/2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value as PeriodeKkn["semester"] })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="ganjil">Ganjil</option>
                    <option value="genap">Genap</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mulai Daftar</label>
                  <input type="date" value={form.tgl_mulai_daftar} onChange={(e) => setForm({ ...form, tgl_mulai_daftar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selesai Daftar</label>
                  <input type="date" value={form.tgl_selesai_daftar} onChange={(e) => setForm({ ...form, tgl_selesai_daftar: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mulai KKN</label>
                  <input type="date" value={form.tgl_mulai_kkn} onChange={(e) => setForm({ ...form, tgl_mulai_kkn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selesai KKN</label>
                  <input type="date" value={form.tgl_selesai_kkn} onChange={(e) => setForm({ ...form, tgl_selesai_kkn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kuota Peserta</label>
                  <input type="number" value={form.kuota_peserta} onChange={(e) => setForm({ ...form, kuota_peserta: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={form.apakah_aktif} onChange={(e) => setForm({ ...form, apakah_aktif: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                  </label>
                </div>
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
