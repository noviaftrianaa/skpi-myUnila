"use client";

import { useState, useMemo } from "react";
import { Chip, Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyKomponenPenilaian } from "@/lib/services/si-kkn/dummyData";
import type { KomponenPenilaian } from "@/lib/services/si-kkn/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const penilaiColors: Record<string, { color: "primary" | "success" | "secondary"; label: string }> = {
  dpl: { color: "primary", label: "DPL" },
  pamong: { color: "success", label: "Pamong" },
  admin: { color: "secondary", label: "Admin" },
};

const emptyForm = {
  kode_komponen: "",
  nm_komponen: "",
  bobot_persen: 10,
  penilai: "dpl" as KomponenPenilaian["penilai"],
  deskripsi: "",
  urutan: 1,
  apakah_aktif: true,
};

export default function KomponenPenilaianTab() {
  const [data, setData] = useState(dummyKomponenPenilaian);
  const [filterPenilai, setFilterPenilai] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!filterPenilai) return data;
    return data.filter((d) => d.penilai === filterPenilai);
  }, [data, filterPenilai]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: KomponenPenilaian) => {
    setEditId(item.id_komponen);
    setForm({
      kode_komponen: item.kode_komponen,
      nm_komponen: item.nm_komponen,
      bobot_persen: item.bobot_persen,
      penilai: item.penilai,
      deskripsi: item.deskripsi || "",
      urutan: item.urutan,
      apakah_aktif: item.apakah_aktif,
    });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.kode_komponen || !form.nm_komponen) {
      toast.error("Kode dan Nama Komponen wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_komponen === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Komponen penilaian berhasil diperbarui");
    } else {
      const newItem: KomponenPenilaian = { id_komponen: `kp-${Date.now()}`, ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Komponen penilaian berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_komponen !== id));
    toast.success("Komponen penilaian berhasil dihapus");
  };

  const columns: Column<KomponenPenilaian>[] = [
    {
      key: "kode_komponen", label: "KODE", width: "130px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.kode_komponen}</span>,
    },
    {
      key: "nm_komponen", label: "NAMA KOMPONEN", sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.nm_komponen}</p>
          {item.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>}
        </div>
      ),
    },
    {
      key: "bobot_persen", label: "BOBOT", width: "90px", sortable: true,
      render: (item) => <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.bobot_persen}%</span>,
    },
    {
      key: "penilai", label: "PENILAI", width: "120px",
      render: (item) => {
        const p = penilaiColors[item.penilai];
        return <Chip size="sm" color={p.color} variant="flat">{p.label}</Chip>;
      },
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
          <button onClick={() => handleDelete(item.id_komponen)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
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
        searchPlaceholder="Cari komponen penilaian..."
        searchKeys={["kode_komponen", "nm_komponen"]}
        defaultRowsPerPage={10}
        filterSlot={
          <div className="flex items-center gap-2">
            <select
              value={filterPenilai}
              onChange={(e) => setFilterPenilai(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Penilai</option>
              <option value="dpl">DPL</option>
              <option value="pamong">Pamong</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        }
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
                {editId ? "Edit Komponen Penilaian" : "Tambah Komponen Penilaian"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Komponen *</label>
                <input type="text" value={form.kode_komponen} onChange={(e) => setForm({ ...form, kode_komponen: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: KEHADIRAN" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Komponen *</label>
                <input type="text" value={form.nm_komponen} onChange={(e) => setForm({ ...form, nm_komponen: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: Kehadiran" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi komponen..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bobot (%)</label>
                  <input type="number" value={form.bobot_persen} onChange={(e) => setForm({ ...form, bobot_persen: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Penilai</label>
                  <select value={form.penilai} onChange={(e) => setForm({ ...form, penilai: e.target.value as KomponenPenilaian["penilai"] })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="dpl">DPL</option>
                    <option value="pamong">Pamong</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
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
