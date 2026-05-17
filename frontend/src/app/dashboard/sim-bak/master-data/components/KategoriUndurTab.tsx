"use client";

import { useState, useEffect, useCallback } from "react";
import { Chip, Button } from "@heroui/react";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getKategoriUndur, createKategoriUndur, updateKategoriUndur, deleteKategoriUndur } from "@/lib/services/sim-bak/simBakService";
import type { KategoriUndur } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const emptyForm = { id_kategori_undur: "", nm_kategori: "", deskripsi: "", a_aktif: true, urutan: 1 };

const inputWrap: React.CSSProperties = { borderRadius: "0.5rem", border: "1px solid #d1d5db" };

export default function KategoriUndurTab() {
  const [data, setData] = useState<KategoriUndur[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  void loading; void page; void setPage;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getKategoriUndur({ page, limit: 10 });
      setData(result.data);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditId(null); setForm({ ...emptyForm }); setShowPanel(true); };
  const openEdit = (item: KategoriUndur) => {
    setEditId(item.id_kategori_undur);
    setForm({ id_kategori_undur: item.id_kategori_undur, nm_kategori: item.nm_kategori, deskripsi: item.deskripsi || "", a_aktif: item.a_aktif, urutan: item.urutan });
    setShowPanel(true);
  };

  const handleSave = async () => {
    if (!form.nm_kategori.trim()) { toast.error("Nama kategori wajib diisi"); return; }
    if (!editId && !form.id_kategori_undur.trim()) { toast.error("ID kategori wajib diisi"); return; }
    setSaving(true);
    try {
      if (editId) {
        await updateKategoriUndur(editId, { nm_kategori: form.nm_kategori, deskripsi: form.deskripsi || undefined, a_aktif: form.a_aktif, urutan: form.urutan });
        toast.success("Kategori undur berhasil diperbarui");
      } else {
        await createKategoriUndur(form);
        toast.success("Kategori undur berhasil ditambahkan");
      }
      setShowPanel(false); fetchData();
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const executeDelete = async () => {
    try { await deleteKategoriUndur(deleteConfirmId); toast.success("Berhasil dihapus"); setDeleteConfirmId(""); fetchData(); }
    catch { toast.error("Gagal menghapus"); }
  };

  const columns: Column<KategoriUndur>[] = [
    { key: "nm_kategori", label: "NAMA KATEGORI", sortable: true, render: (item) => <span className="font-medium text-gray-900 dark:text-white">{item.nm_kategori}</span> },
    { key: "id_kategori_undur", label: "KODE", width: "150px", render: (item) => <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{item.id_kategori_undur}</span> },
    { key: "deskripsi", label: "DESKRIPSI", render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.deskripsi || "-"}</span> },
    { key: "a_aktif", label: "STATUS", width: "100px", render: (item) => <Chip size="sm" color={item.a_aktif ? "success" : "default"} variant="flat">{item.a_aktif ? "Aktif" : "Nonaktif"}</Chip> },
    { key: "urutan", label: "URUTAN", width: "80px", render: (item) => <span className="text-sm">{item.urutan}</span> },
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_kategori_undur)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={data} columns={columns} searchable searchPlaceholder="Cari kategori undur..." searchKeys={["nm_kategori", "id_kategori_undur"]} defaultRowsPerPage={10}
        actionSlot={<Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">Tambah</Button>}
      />

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Kategori Undur" : "Tambah Kategori Undur"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!editId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Kategori *</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <input type="text" value={form.id_kategori_undur} onChange={(e) => setForm({ ...form, id_kategori_undur: e.target.value.toLowerCase().replace(/[^a-z_]/g, '') })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="cth: undur_diri, pindah_pt" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Huruf kecil dan underscore saja, tidak bisa diubah setelah dibuat</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kategori *</label>
                <div style={inputWrap} className="overflow-hidden">
                  <input type="text" value={form.nm_kategori} onChange={(e) => setForm({ ...form, nm_kategori: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none" placeholder="cth: Pengunduran Diri" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <div style={inputWrap} className="overflow-hidden">
                  <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none resize-none" placeholder="Penjelasan singkat kategori..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                <div style={inputWrap} className="overflow-hidden">
                  <input type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.a_aktif} onChange={(e) => setForm({ ...form, a_aktif: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
              </label>
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
    <ConfirmDialog open={!!deleteConfirmId} title="Hapus Kategori Undur" message="Hapus kategori ini? Data pengajuan yang sudah menggunakan kategori ini mungkin terpengaruh." confirmLabel="Hapus" confirmColor="danger" onConfirm={executeDelete} onCancel={() => setDeleteConfirmId("")} />
    </>
  );
}
