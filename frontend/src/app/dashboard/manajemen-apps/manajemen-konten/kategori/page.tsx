"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { manajemenKontenMenuConfig } from "../config/menuConfig";
import manajemenKontenService, { Kategori } from "@/lib/services/manajemen-konten/manajemenKontenService";
import { Toaster, toast } from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiX, FiSave, FiArrowLeft } from "react-icons/fi";

const APP_KEY = "manajemen-konten";

const COLOR_OPTIONS = [
  { value: "blue", className: "bg-blue-100 text-blue-700" },
  { value: "purple", className: "bg-purple-100 text-purple-700" },
  { value: "green", className: "bg-green-100 text-green-700" },
  { value: "amber", className: "bg-amber-100 text-amber-700" },
  { value: "rose", className: "bg-rose-100 text-rose-700" },
  { value: "slate", className: "bg-slate-100 text-slate-700" },
  { value: "sky", className: "bg-sky-100 text-sky-700" },
  { value: "gray", className: "bg-gray-100 text-gray-700" },
];

export default function KategoriPage() {
  useRequireAuth();
  const [data, setData] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Kategori | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [iconName, setIconName] = useState("");
  const [color, setColor] = useState("blue");
  const [jenis, setJenis] = useState<"pengumuman" | "berita" | "both">("both");
  const [urutan, setUrutan] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    try {
      const r = await manajemenKontenService.listKategori();
      if (r.success) setData(r.data);
    } catch (err: any) {
      toast.error("Gagal memuat: " + (err?.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const openNew = () => {
    setEditing(null);
    setKode("");
    setNama("");
    setIconName("");
    setColor("blue");
    setJenis("both");
    setUrutan(data.length + 1);
    setIsActive(true);
    setShowForm(true);
  };

  const openEdit = (k: Kategori) => {
    setEditing(k);
    setKode(k.kode);
    setNama(k.nama);
    setIconName(k.icon_name || "");
    setColor(k.color || "blue");
    setJenis(k.jenis);
    setUrutan(k.urutan);
    setIsActive(k.is_active);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    if (!kode.trim() || !nama.trim()) {
      toast.error("Kode dan Nama wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await manajemenKontenService.updateKategori(editing.id_kategori, {
          nama,
          icon_name: iconName || null,
          color: color || null,
          jenis,
          urutan,
          is_active: isActive,
        });
        toast.success("Kategori updated");
      } else {
        await manajemenKontenService.createKategori({
          kode,
          nama,
          icon_name: iconName || null,
          color: color || null,
          jenis,
          urutan,
          is_active: isActive,
        });
        toast.success("Kategori dibuat");
      }
      closeForm();
      reload();
    } catch (err: any) {
      toast.error("Gagal: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (k: Kategori) => {
    if (!window.confirm(`Hapus kategori "${k.nama}"?`)) return;
    try {
      await manajemenKontenService.deleteKategori(k.id_kategori);
      toast.success("Kategori dihapus");
      reload();
    } catch (err: any) {
      toast.error("Gagal: " + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Manajemen Konten"
      appIcon={<FiTag className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={manajemenKontenMenuConfig}
      pageTitle="Kategori Konten"
    >
      <Toaster position="top-right" />
      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Link href="/dashboard/manajemen-apps/manajemen-konten" className="hover:text-blue-600">
              Manajemen Konten
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">Kategori</span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Kategori Konten</h1>
              <p className="text-sm text-gray-600 mt-1">
                Taxonomy untuk pengumuman, berita, & artikel —{" "}
                <span className="font-semibold text-gray-800">{data.length}</span> kategori
              </p>
            </div>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              <FiPlus className="w-4 h-4" /> Kategori Baru
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.map((k) => {
              const colorCfg = COLOR_OPTIONS.find((c) => c.value === k.color) || COLOR_OPTIONS[0];
              return (
                <div
                  key={k.id_kategori}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4 ${
                    !k.is_active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${colorCfg.className}`}>
                      {k.nama}
                    </div>
                    {!k.is_active && (
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        OFF
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    Kode: <code className="font-mono text-gray-700">{k.kode}</code>
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Jenis:{" "}
                    <span className="font-semibold capitalize text-gray-700">
                      {k.jenis === "both" ? "Semua" : k.jenis}
                    </span>{" "}
                    · Urutan: {k.urutan}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(k)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <FiEdit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(k)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    >
                      <FiTrash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editing ? "Edit Kategori" : "Kategori Baru"}
              </h3>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Kode <span className="text-red-500">*</span>{" "}
                  <span className="text-gray-400 font-normal">(unique, lowercase)</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  disabled={!!editing}
                  onChange={(e) => setKode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="contoh: pengumuman-pmb"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="contoh: Pengumuman PMB"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Jenis</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="both">Semua (both)</option>
                    <option value="pengumuman">Pengumuman saja</option>
                    <option value="berita">Berita saja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Urutan</label>
                  <input
                    type="number"
                    value={urutan}
                    onChange={(e) => setUrutan(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Icon Name</label>
                <input
                  type="text"
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  placeholder="heroicons:academic-cap"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Format: heroicons:NAMA — lihat heroicons.com</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold border-2 transition-all ${
                        color === c.value ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-100"
                      } ${c.className}`}
                    >
                      {c.value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only"
                />
                <span
                  className={`inline-flex w-4 h-4 items-center justify-center rounded border ${
                    isActive ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                  }`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span className="text-xs text-gray-700">Aktif (tampil di dropdown form konten)</span>
              </label>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-sm disabled:opacity-50"
              >
                <FiSave className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
