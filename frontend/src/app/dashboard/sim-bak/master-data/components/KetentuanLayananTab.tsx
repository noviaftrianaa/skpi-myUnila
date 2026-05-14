"use client";

import { useState, useEffect, useCallback } from "react";
import { Chip, Button } from "@heroui/react";
import ConfirmDialog from "../../components/ConfirmDialog";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getKetentuan, createKetentuan, updateKetentuan, deleteKetentuan, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { KetentuanLayanan, JenisLayanan } from "@/lib/services/sim-bak/types";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

type FormState = {
  id_jenis_layanan: string;
  nm_jenjang: string;
  kondisi_semester: string;
  kode_ketentuan: string;
  nm_ketentuan: string;
  operator: string;
  nilai: string;
  pesan_gagal: string;
  deskripsi: string;
  a_aktif: boolean;
  urutan: number;
};

const emptyForm: FormState = {
  id_jenis_layanan: "",
  nm_jenjang: "",
  kondisi_semester: "",
  kode_ketentuan: "ipk_min",
  nm_ketentuan: "IPK Minimum",
  operator: ">=",
  nilai: "",
  pesan_gagal: "",
  deskripsi: "",
  a_aktif: true,
  urutan: 1,
};

const KODE_OPTIONS = [
  { value: "ipk_min", label: "IPK Minimum", default_nm: "IPK Minimum" },
  { value: "sks_min", label: "SKS Lulus Minimum", default_nm: "SKS Lulus Minimum" },
  { value: "semester_max", label: "Semester Maksimum", default_nm: "Semester Maksimum" },
  { value: "masa_studi_min", label: "Masa Studi Minimum", default_nm: "Masa Studi Minimum" },
];

const OPERATOR_OPTIONS = ["<", "<=", "=", "!=", ">=", ">"];
const JENJANG_OPTIONS = ["", "D3", "S1", "S2", "S3", "D4"];

const inputWrap: React.CSSProperties = { borderRadius: "0.5rem", border: "1px solid #d1d5db" };

export default function KetentuanLayananTab() {
  const [data, setData] = useState<KetentuanLayanan[]>([]);
  const [layananList, setLayananList] = useState<JenisLayanan[]>([]);
  const [filterLayanan, setFilterLayanan] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState("");

  void loading;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getKetentuan({ page, limit: 50, id_jenis_layanan: filterLayanan || undefined });
      setData(result.data);
    } catch { toast.error("Gagal memuat data"); }
    finally { setLoading(false); }
  }, [page, filterLayanan]);

  useEffect(() => {
    getJenisLayananPublic().then(setLayananList).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditId(null);
    setForm({ ...emptyForm, id_jenis_layanan: filterLayanan || (layananList[0]?.id_jenis_layanan ?? "") });
    setShowPanel(true);
  };
  const openEdit = (item: KetentuanLayanan) => {
    setEditId(item.id_ketentuan);
    setForm({
      id_jenis_layanan: item.id_jenis_layanan,
      nm_jenjang: item.nm_jenjang ?? "",
      kondisi_semester: item.kondisi_semester != null ? String(item.kondisi_semester) : "",
      kode_ketentuan: item.kode_ketentuan,
      nm_ketentuan: item.nm_ketentuan,
      operator: item.operator,
      nilai: String(item.nilai),
      pesan_gagal: item.pesan_gagal ?? "",
      deskripsi: item.deskripsi ?? "",
      a_aktif: item.a_aktif,
      urutan: item.urutan,
    });
    setShowPanel(true);
  };

  const handleKodeChange = (kode: string) => {
    const opt = KODE_OPTIONS.find(o => o.value === kode);
    setForm(f => ({ ...f, kode_ketentuan: kode, nm_ketentuan: opt?.default_nm ?? f.nm_ketentuan }));
  };

  const handleSave = async () => {
    if (!form.id_jenis_layanan) { toast.error("Jenis layanan wajib dipilih"); return; }
    if (!form.nm_ketentuan.trim()) { toast.error("Nama ketentuan wajib diisi"); return; }
    if (!form.nilai.trim() || isNaN(Number(form.nilai))) { toast.error("Nilai harus angka"); return; }
    setSaving(true);
    try {
      const payload = {
        id_jenis_layanan: form.id_jenis_layanan,
        nm_jenjang: form.nm_jenjang || null,
        kondisi_semester: form.kondisi_semester ? Number(form.kondisi_semester) : null,
        kode_ketentuan: form.kode_ketentuan,
        nm_ketentuan: form.nm_ketentuan,
        operator: form.operator,
        nilai: Number(form.nilai),
        pesan_gagal: form.pesan_gagal || null,
        deskripsi: form.deskripsi || null,
        a_aktif: form.a_aktif,
        urutan: form.urutan,
      };
      if (editId) {
        await updateKetentuan(editId, payload as Partial<KetentuanLayanan>);
        toast.success("Ketentuan berhasil diperbarui");
      } else {
        await createKetentuan(payload as Partial<KetentuanLayanan>);
        toast.success("Ketentuan berhasil ditambahkan");
      }
      setShowPanel(false); fetchData();
    } catch { toast.error("Gagal menyimpan"); } finally { setSaving(false); }
  };

  const handleDelete = (id: string) => setDeleteConfirmId(id);
  const executeDelete = async () => {
    try { await deleteKetentuan(deleteConfirmId); toast.success("Berhasil dihapus"); setDeleteConfirmId(""); fetchData(); }
    catch { toast.error("Gagal menghapus"); }
  };

  const columns: Column<KetentuanLayanan>[] = [
    { key: "kode_layanan", label: "LAYANAN", width: "120px", render: (item) => <span className="font-mono text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">{item.kode_layanan}</span> },
    { key: "nm_jenjang", label: "JENJANG", width: "90px", render: (item) => <span className="text-sm">{item.nm_jenjang ?? "—"}</span> },
    { key: "kondisi_semester", label: "SEM", width: "70px", render: (item) => <span className="text-sm">{item.kondisi_semester ?? "—"}</span> },
    { key: "nm_ketentuan", label: "KETENTUAN", render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_ketentuan}</span> },
    { key: "rule", label: "ATURAN", width: "120px", render: (item) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.operator} {item.nilai}</span> },
    { key: "a_aktif", label: "STATUS", width: "100px", render: (item) => <Chip size="sm" color={item.a_aktif ? "success" : "default"} variant="flat">{item.a_aktif ? "Aktif" : "Nonaktif"}</Chip> },
    { key: "aksi", label: "AKSI", width: "100px", render: (item) => (
      <div className="flex items-center gap-1">
        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors"><FiEdit2 className="w-4 h-4" /></button>
        <button onClick={() => handleDelete(item.id_ketentuan)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
      </div>
    )},
  ];

  return (
    <>
    <div className="relative">
      <Toaster position="top-right" />
      <DataTable data={data} columns={columns} searchable searchPlaceholder="Cari ketentuan..." searchKeys={["nm_ketentuan", "kode_ketentuan"]} defaultRowsPerPage={50}
        filterSlot={
          <select value={filterLayanan} onChange={e => { setFilterLayanan(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm">
            <option value="">Semua Layanan</option>
            {layananList.map(l => <option key={l.id_jenis_layanan} value={l.id_jenis_layanan}>{l.kode_layanan} — {l.nm_layanan}</option>)}
          </select>
        }
        actionSlot={<Button size="sm" color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={openAdd} className="rounded-lg">Tambah</Button>}
      />

      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl h-full overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Ketentuan" : "Tambah Ketentuan"}</h3>
              <button onClick={() => setShowPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><FiX className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Layanan *</label>
                <div style={inputWrap} className="overflow-hidden">
                  <select value={form.id_jenis_layanan} onChange={e => setForm({ ...form, id_jenis_layanan: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                    <option value="">— Pilih Layanan —</option>
                    {layananList.map(l => <option key={l.id_jenis_layanan} value={l.id_jenis_layanan}>{l.kode_layanan} — {l.nm_layanan}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenjang</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <select value={form.nm_jenjang} onChange={e => setForm({ ...form, nm_jenjang: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                      {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j === "" ? "(Semua jenjang)" : j}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kondisi Semester</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <input type="number" min="1" max="20" value={form.kondisi_semester} onChange={e => setForm({ ...form, kondisi_semester: e.target.value })}
                      placeholder="(opsional)"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kode Ketentuan *</label>
                <div style={inputWrap} className="overflow-hidden">
                  <select value={form.kode_ketentuan} onChange={e => handleKodeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                    {KODE_OPTIONS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Ketentuan *</label>
                <div style={inputWrap} className="overflow-hidden">
                  <input type="text" value={form.nm_ketentuan} onChange={e => setForm({ ...form, nm_ketentuan: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none" placeholder="cth: IPK Minimum" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operator *</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <select value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                      {OPERATOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nilai *</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <input type="number" step="0.01" value={form.nilai} onChange={e => setForm({ ...form, nilai: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan Gagal (opsional)</label>
                <div style={inputWrap} className="overflow-hidden">
                  <input type="text" value={form.pesan_gagal} onChange={e => setForm({ ...form, pesan_gagal: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none" placeholder="Custom pesan untuk user..." />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <div style={inputWrap} className="overflow-hidden">
                  <textarea value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none resize-none" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urutan</label>
                  <div style={inputWrap} className="overflow-hidden">
                    <input type="number" value={form.urutan} onChange={e => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                      className="w-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input type="checkbox" checked={form.a_aktif} onChange={e => setForm({ ...form, a_aktif: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Aktif</span>
                </label>
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
    <ConfirmDialog open={!!deleteConfirmId} title="Hapus Ketentuan" message="Hapus ketentuan ini? Pengajuan yang sudah berjalan tidak akan terpengaruh." confirmLabel="Hapus" confirmColor="danger" onConfirm={executeDelete} onCancel={() => setDeleteConfirmId("")} />
    </>
  );
}
