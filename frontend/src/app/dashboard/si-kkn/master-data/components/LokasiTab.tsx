"use client";

import { useState, useMemo } from "react";
import { Button } from "@heroui/react";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyLokasiKkn, dummyWilayahKkn } from "@/lib/services/si-kkn/dummyData";
import type { LokasiKkn } from "@/lib/services/si-kkn/types";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = {
  id_wilayah: "",
  nm_desa: "",
  nm_kecamatan: "",
  nm_kabupaten: "",
  provinsi: "Lampung",
  kode_pos: "",
  alamat_posko: "",
  latitude: 0,
  longitude: 0,
  kuota_mahasiswa: 10,
  apakah_aktif: true,
};

export default function LokasiTab() {
  const [data, setData] = useState(dummyLokasiKkn);
  const [filterKabupaten, setFilterKabupaten] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const kabupatenList = useMemo(() => [...new Set(data.map((d) => d.nm_kabupaten))], [data]);

  const filtered = useMemo(() => {
    if (!filterKabupaten) return data;
    return data.filter((d) => d.nm_kabupaten === filterKabupaten);
  }, [data, filterKabupaten]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: LokasiKkn) => {
    setEditId(item.id_lokasi);
    setForm({
      id_wilayah: item.id_wilayah,
      nm_desa: item.nm_desa,
      nm_kecamatan: item.nm_kecamatan,
      nm_kabupaten: item.nm_kabupaten,
      provinsi: item.provinsi,
      kode_pos: item.kode_pos || "",
      alamat_posko: item.alamat_posko || "",
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      kuota_mahasiswa: item.kuota_mahasiswa,
      apakah_aktif: item.apakah_aktif,
    });
    setShowPanel(true);
  };

  const handleSave = () => {
    if (!form.nm_desa || !form.nm_kecamatan || !form.nm_kabupaten) {
      toast.error("Nama Desa, Kecamatan, dan Kabupaten wajib diisi");
      return;
    }
    if (editId) {
      setData((prev) => prev.map((d) => d.id_lokasi === editId ? { ...d, ...form, updated_at: new Date().toISOString() } : d));
      toast.success("Lokasi berhasil diperbarui");
    } else {
      const newItem: LokasiKkn = { id_lokasi: `lok-${Date.now()}`, ...form, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      setData((prev) => [...prev, newItem]);
      toast.success("Lokasi berhasil ditambahkan");
    }
    setShowPanel(false);
  };

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((d) => d.id_lokasi !== id));
    toast.success("Lokasi berhasil dihapus");
  };

  const columns: Column<LokasiKkn>[] = [
    {
      key: "id_lokasi", label: "KODE", width: "100px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.id_lokasi}</span>,
    },
    {
      key: "nm_desa", label: "NAMA DESA", sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.nm_desa}</p>
          {item.alamat_posko && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.alamat_posko}</p>}
        </div>
      ),
    },
    {
      key: "nm_kecamatan", label: "KECAMATAN", width: "150px", sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_kecamatan}</span>,
    },
    {
      key: "nm_kabupaten", label: "KABUPATEN", width: "160px", sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_kabupaten}</span>,
    },
    {
      key: "provinsi", label: "PROVINSI", width: "120px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.provinsi}</span>,
    },
    {
      key: "latitude", label: "KOORDINAT", width: "160px",
      render: (item) => (
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          {item.latitude && item.longitude ? `${item.latitude}, ${item.longitude}` : "-"}
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
          <button onClick={() => handleDelete(item.id_lokasi)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
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
        searchPlaceholder="Cari lokasi..."
        searchKeys={["nm_desa", "nm_kecamatan", "nm_kabupaten"]}
        defaultRowsPerPage={10}
        filterSlot={
          <div className="flex items-center gap-2">
            <select
              value={filterKabupaten}
              onChange={(e) => setFilterKabupaten(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kabupaten</option>
              {kabupatenList.map((k) => <option key={k} value={k}>{k}</option>)}
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
                {editId ? "Edit Lokasi" : "Tambah Lokasi"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Wilayah</label>
                <select value={form.id_wilayah} onChange={(e) => setForm({ ...form, id_wilayah: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Wilayah</option>
                  {dummyWilayahKkn.map((w) => <option key={w.id_wilayah} value={w.id_wilayah}>{w.nm_wilayah}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Desa *</label>
                <input type="text" value={form.nm_desa} onChange={(e) => setForm({ ...form, nm_desa: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: Desa Way Huwi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kecamatan *</label>
                  <input type="text" value={form.nm_kecamatan} onChange={(e) => setForm({ ...form, nm_kecamatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cth: Jati Agung" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kabupaten *</label>
                  <input type="text" value={form.nm_kabupaten} onChange={(e) => setForm({ ...form, nm_kabupaten: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="cth: Lampung Selatan" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provinsi</label>
                  <input type="text" value={form.provinsi} onChange={(e) => setForm({ ...form, provinsi: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Pos</label>
                  <input type="text" value={form.kode_pos} onChange={(e) => setForm({ ...form, kode_pos: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Posko</label>
                <textarea value={form.alamat_posko} onChange={(e) => setForm({ ...form, alamat_posko: e.target.value })} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Alamat lengkap posko KKN..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Latitude</label>
                  <input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Longitude</label>
                  <input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kuota Mahasiswa</label>
                  <input type="number" value={form.kuota_mahasiswa} onChange={(e) => setForm({ ...form, kuota_mahasiswa: parseInt(e.target.value) || 0 })}
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
