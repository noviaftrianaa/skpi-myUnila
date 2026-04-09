"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Chip, Button } from "@heroui/react";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getJenisLayanan, createJenisLayanan, updateJenisLayanan, deleteJenisLayanan } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const kategoriColors: Record<string, { color: "primary" | "secondary" | "warning" | "success"; label: string }> = {
  surat_mandiri: { color: "primary", label: "Surat Mandiri" },
  permohonan_akademik: { color: "secondary", label: "Permohonan Akademik" },
  batch_administrasi: { color: "warning", label: "Batch Administrasi" },
  monitoring: { color: "success", label: "Monitoring" },
};

const emptyForm = { kode_layanan: "", nm_layanan: "", kategori: "surat_mandiri" as JenisLayanan["kategori"], deskripsi: "", urutan: 1, a_aktif: true, sla_hari: null as number | null };

export default function JenisLayananTab() {
  const [data, setData] = useState<JenisLayanan[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterKategori, setFilterKategori] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getJenisLayanan({ page, limit: 10, kategori: filterKategori || undefined });
      setData(result.data);
      setTotal(result.pagination.total);
    } catch {
      toast.error("Gagal memuat data jenis layanan");
    } finally {
      setLoading(false);
    }
  }, [page, filterKategori]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowPanel(true);
  };

  const openEdit = (item: JenisLayanan) => {
    setEditId(item.id_jenis_layanan);
    setForm({ kode_layanan: item.kode_layanan, nm_layanan: item.nm_layanan, kategori: item.kategori, deskripsi: item.deskripsi || "", urutan: item.urutan, a_aktif: item.a_aktif, sla_hari: item.sla_hari });
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!form.kode_layanan || !form.nm_layanan) {
      toast.error("Kode dan Nama Layanan wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateJenisLayanan(editId, form);
        toast.success("Jenis layanan berhasil diperbarui");
      } else {
        await createJenisLayanan(form);
        toast.success("Jenis layanan berhasil ditambahkan");
      }
      setShowPanel(false);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const executeDelete = async () => {
    try {
      await deleteJenisLayanan(deleteConfirmId);
      toast.success("Jenis layanan berhasil dihapus");
      setDeleteConfirmId("");
      fetchData();
    } catch {
      toast.error("Gagal menghapus data");
    }
  };

  const columns: Column<JenisLayanan>[] = [
    {
      key: "kode_layanan", label: "KODE", width: "120px", sortable: true,
      render: (item) => <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{item.kode_layanan}</span>,
    },
    {
      key: "nm_layanan", label: "NAMA LAYANAN", sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{item.nm_layanan}</p>
          {item.deskripsi && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{item.deskripsi}</p>}
        </div>
      ),
    },
    {
      key: "kategori", label: "KATEGORI", width: "180px",
      render: (item) => {
        const k = kategoriColors[item.kategori];
        return k ? <Chip size="sm" color={k.color} variant="flat">{k.label}</Chip> : <span>{item.kategori}</span>;
      },
    },
    {
      key: "sla_hari", label: "SLA", width: "80px",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.sla_hari ? `${item.sla_hari}h` : "-"}</span>,
    },
    {
      key: "a_aktif", label: "STATUS", width: "100px",
      render: (item) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${item.a_aktif ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"}`}>
          {item.a_aktif ? "Aktif" : "Nonaktif"}
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
          <button onClick={() => handleDelete(item.id_jenis_layanan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors" title="Hapus">
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable
        data={data}
        columns={columns}
        searchable
        searchPlaceholder="Cari jenis layanan..."
        searchKeys={["kode_layanan", "nm_layanan"]}
        defaultRowsPerPage={10}
        filterSlot={
          <select
            value={filterKategori}
            onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="surat_mandiri">Surat Mandiri</option>
            <option value="permohonan_akademik">Permohonan Akademik</option>
            <option value="batch_administrasi">Batch Administrasi</option>
            <option value="monitoring">Monitoring</option>
          </select>
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
                {editId ? "Edit Jenis Layanan" : "Tambah Jenis Layanan"}
              </h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Layanan *</label>
                <input type="text" value={form.kode_layanan} onChange={(e) => setForm({ ...form, kode_layanan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: SK-LOA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Layanan *</label>
                <input type="text" value={form.nm_layanan} onChange={(e) => setForm({ ...form, nm_layanan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cth: Surat Keterangan Diterima" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value as JenisLayanan["kategori"] })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="surat_mandiri">Surat Mandiri</option>
                  <option value="permohonan_akademik">Permohonan Akademik</option>
                  <option value="batch_administrasi">Batch Administrasi</option>
                  <option value="monitoring">Monitoring</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Deskripsi layanan..." />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SLA (hari)</label>
                  <input type="number" value={form.sla_hari ?? ""} onChange={(e) => setForm({ ...form, sla_hari: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="-" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input type="checkbox" checked={form.a_aktif} onChange={(e) => setForm({ ...form, a_aktif: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
              <button onClick={() => setShowPanel(false)} className="flex-1 px-4 py-2.5 rounded-lg ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Batal
              </button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <FiLoader className="w-4 h-4 animate-spin" />}
                {editId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    <ConfirmDialog open={!!deleteConfirmId} title="Hapus Data" message="Hapus jenis layanan ini? Persyaratan dan tahapan terkait juga akan terhapus." confirmLabel="Hapus" confirmColor="danger" onConfirm={executeDelete} onCancel={() => setDeleteConfirmId("")} />
    </>
  );
}
