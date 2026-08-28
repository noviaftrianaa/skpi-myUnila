// src/pages/mahasiswa/DataKarya.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";
import { useLock } from "../../contexts/LockContext";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Upload,
  Calendar,
  Lock,
} from "lucide-react";

const initialKaryaMahasiswa = [
  {
    id: 1,
    judul: "Desain UI/UX Aplikasi Akademik MyUnila",
    kategori: "Karya",
    bentukKarya: "Karya Seni / Desain",
    tanggal: "20 Nov 2025",
    tautan: "https://dribbble.com/sample-karya",
  },
  {
    id: 2,
    judul: "Aplikasi Monitoring Energi Terbarukan",
    kategori: "Karya",
    bentukKarya: "Aplikasi / Software",
    tanggal: "10 Jun 2025",
    tautan: "https://github.com/sample-energy-monitor",
  },
];

export default function DataKaryaMahasiswa() {
  const navigate = useNavigate();
  const { isLocked } = useLock();
  const [karyaList, setKaryaList] = useState(initialKaryaMahasiswa);
  const [search, setSearch] = useState("");

  const [detailModalItem, setDetailModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const filteredKarya = karyaList.filter((item) =>
    item.judul.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteModalItem) return;
    setKaryaList((prev) => prev.filter((k) => k.id !== deleteModalItem.id));
    setDeleteModalItem(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Data Karya
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Kumpulan karya & portofolio yang kamu ajukan.
              </p>
            </div>

            {!isLocked && (
              <button
                onClick={() => navigate("/tambah-kegiatan", { state: { kategori: "Karya" } })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus size={16} />
                <span>Tambah Karya</span>
              </button>
            )}
          </div>

          {/* LOCKED BANNER */}
          {isLocked && (
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#E02424] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E02424] dark:text-rose-300">
                    Transkrip SKPI telah dikunci (final)
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-0.5">
                    Karya tidak dapat ditambah, diubah, atau dihapus lagi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/cetak-skpi")}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E02424] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
              >
                <Download size={14} />
                <span>Unduh Transkrip</span>
              </button>
            </div>
          )}

          {/* SEARCH BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari karya..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          {/* KARYA CARDS LIST */}
          <div className="space-y-4">
            {filteredKarya.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 hover:border-blue-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 truncate">
                      {item.judul}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                        <Calendar size={14} className="text-gray-400 shrink-0" />
                        <span>{item.tanggal}</span>
                      </span>

                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-pink-100/70 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                        {item.kategori}
                      </span>

                      <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {item.bentukKarya}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-400 shrink-0">
                  {item.tautan && (
                    <a
                      href={item.tautan}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-blue-600 transition-colors"
                      title="Buka Tautan Portofolio"
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}

                  <button
                    onClick={() => setDetailModalItem(item)}
                    className="hover:text-blue-600 transition-colors cursor-pointer"
                    title="Detail Karya"
                  >
                    <Eye size={18} />
                  </button>

                  {!isLocked && (
                    <>
                      <button
                        onClick={() => setEditModalItem(item)}
                        className="hover:text-blue-600 transition-colors cursor-pointer"
                        title="Edit Karya"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => setDeleteModalItem(item)}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                        title="Hapus Karya"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-400">
            Menampilkan {filteredKarya.length} dari {karyaList.length} karya
          </div>
        </main>
      </div>

      {/* DETAIL KARYA MODAL (EXACT MATCH USER SCREENSHOT) */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-100 dark:border-slate-800">
            {/* Left Pane */}
            <div className="lg:w-1/2 p-6 overflow-y-auto space-y-5 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 inline-block">
                  DETAIL KARYA
                </span>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 mt-2">
                  {detailModalItem.judul}
                </h2>
              </div>

              {/* Card 1: PROFIL MAHASISWA */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PROFIL MAHASISWA</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NAMA</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">NOVIA FITRIANA HUDA</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NPM</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">2215061024</span>
                  </div>
                </div>
                <div className="pt-1 text-xs">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">PROGRAM STUDI</span>
                  <span className="font-extrabold text-gray-900 dark:text-slate-100">Program Studi S1 Teknik Informatika (S1)</span>
                </div>
              </div>

              {/* Card 2: INFORMASI KARYA */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">INFORMASI KARYA</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">KATEGORI</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.kategori}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">BENTUK KARYA</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.bentukKarya}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">TANGGAL PEMBUATAN</span>
                  <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.tanggal}</span>
                </div>

                {/* Badges Row */}
                <div className="pt-2 flex items-center gap-2 flex-wrap border-t border-gray-200/60 dark:border-slate-700/60">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                    {detailModalItem.kategori}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {detailModalItem.bentukKarya}
                  </span>
                </div>

                {/* Tautan Karya / Portofolio */}
                <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">TAUTAN KARYA / PORTOFOLIO</span>
                  <a
                    href={detailModalItem.tautan || "https://dribbble.com/contoh-karya"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1"
                  >
                    <ExternalLink size={13} />
                    <span>{detailModalItem.tautan || "https://dribbble.com/contoh-karya"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Pane */}
            <div className="lg:w-1/2 p-6 flex flex-col justify-between bg-gray-50/50 dark:bg-slate-950">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-slate-200">
                    <FileText size={16} className="text-blue-600" />
                    <span>Lampiran Pendukung</span>
                  </div>
                  <button onClick={() => setDetailModalItem(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
                    <X size={18} />
                  </button>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-slate-400 mb-4 px-1">
                  <button onClick={() => setZoomLevel((z) => Math.max(50, z - 10))} className="flex items-center gap-1 hover:text-gray-800 cursor-pointer">
                    <ZoomOut size={13} /> <span>Perkecil</span>
                  </button>
                  <span>100%</span>
                  <button onClick={() => setZoomLevel((z) => Math.min(200, z + 10))} className="flex items-center gap-1 hover:text-gray-800 cursor-pointer">
                    <ZoomIn size={13} /> <span>Perbesar</span>
                  </button>
                  <button onClick={() => setRotation((r) => (r + 90) % 360)} className="flex items-center gap-1 hover:text-gray-800 cursor-pointer ml-2">
                    <RotateCw size={13} /> <span>Putar</span>
                  </button>
                </div>

                {/* Center Preview Box */}
                <div className="min-h-[260px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center text-gray-400">
                  <FileText size={48} className="mb-2 opacity-25" />
                  <p className="text-xs font-medium">Belum ada berkas lampiran diunggah</p>
                </div>
              </div>

              {/* Bottom Right Download Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => alert("Mengunduh berkas...")}
                  className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Unduh</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT KARYA MODAL (PDF Page 10 Bottom) */}
      {(editModalItem || addModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                {editModalItem ? "Edit Karya" : "Tambah Karya Baru"}
              </h3>
              <button
                onClick={() => {
                  setEditModalItem(null);
                  setAddModalOpen(false);
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Judul Karya *</label>
                <input
                  type="text"
                  defaultValue={editModalItem?.judul || ""}
                  placeholder="Aplikasi Monitoring Energi Terbarukan"
                  className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Kategori *</label>
                  <select defaultValue="Karya" className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none">
                    <option>Karya</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Tahun *</label>
                  <select defaultValue="2025" className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none">
                    <option>2026</option>
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Bentuk Karya</label>
                <select defaultValue={editModalItem?.bentukKarya || "Aplikasi / Software"} className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none">
                  <option>Aplikasi / Software</option>
                  <option>Karya Seni / Desain</option>
                  <option>Karya Tulis / Jurnal</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Tanggal Pembuatan</label>
                <input
                  type="date"
                  defaultValue="2025-06-12"
                  className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none text-gray-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Tautan Karya / Portofolio</label>
                <input
                  type="url"
                  defaultValue={editModalItem?.tautan || "https://github.com/contoh/energy-monitor"}
                  placeholder="https://github.com/..."
                  className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-slate-300 block mb-1">Unggah Dokumen Pendukung</label>
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center text-gray-400 bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-700 dark:text-slate-300">
                    Klik untuk unggah atau tarik berkas ke sini
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, PDF (maks. 5MB)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setEditModalItem(null);
                  setAddModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setEditModalItem(null);
                  setAddModalOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Konfirmasi Hapus Karya</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                Yakin ingin menghapus <span className="text-gray-800 dark:text-slate-200">"{deleteModalItem.judul}"</span>?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteModalItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}










