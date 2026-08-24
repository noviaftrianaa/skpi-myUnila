// src/pages/mahasiswa/Pengajuan.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarMahasiswa from "../../components/common/SidebarMahasiswa";
import Navbar from "../../components/common/Navbar";
import { useLock } from "../../contexts/LockContext";
import {
  Search,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Lock,
  X,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Calendar,
  MapPin,
} from "lucide-react";

const initialDataSKPI = [
  {
    id: 1,
    judul: "Pelatihan UI/UX Design",
    tanggal: "20 Okt 2025",
    lokasi: "Jakarta Convention Center",
    kategori: "Pelatihan",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    poin: 15,
    catatanValidator: "",
    nomorSertifikat: "SERT/PLT/2025/0192",
    tautan: "https://drive.google.com/contoh-sertifikat",
  },
  {
    id: 2,
    judul: "National Hackathon 2025",
    tanggal: "15 Okt 2025",
    lokasi: "Institut Teknologi Bandung",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    status: "Ditangguhkan",
    poin: null,
    catatanValidator: "Catatan dari validator: Sertifikat belum terbaca jelas. Mohon unggah ulang dengan resolusi lebih tinggi.",
    nomorSertifikat: "",
    tautan: "",
  },
  {
    id: 3,
    judul: "Leadership Training Seminar",
    tanggal: "10 Okt 2025",
    lokasi: "Gedung H Teknik Elektro",
    kategori: "Seminar",
    tingkatan: "Fakultas",
    jabatan: "Peserta",
    dosenPembimbing: "",
    status: "Divalidasi",
    poin: 10,
    catatanValidator: "",
    nomorSertifikat: "SK/SEM/2025/088",
    tautan: "",
  },
  {
    id: 4,
    judul: "Ketua Himpunan Mahasiswa Teknik Elektro",
    tanggal: "01 Sep 2025",
    lokasi: "Teknik Elektro",
    kategori: "Organisasi",
    tingkatan: "Fakultas",
    jabatan: "Ketua",
    dosenPembimbing: "",
    status: "Divalidasi",
    poin: 25,
    catatanValidator: "",
    nomorSertifikat: "SK/ORG/2025/012",
    tautan: "",
  },
  {
    id: 5,
    judul: "International Conference Paper",
    tanggal: "20 Agu 2025",
    lokasi: "Singapore",
    kategori: "Publikasi",
    tingkatan: "Internasional",
    jabatan: "Penulis Utama",
    dosenPembimbing: "",
    status: "Ditolak",
    poin: null,
    catatanValidator: "Catatan dari validator: Bukti keikutsertaan tidak sesuai. Tidak dapat diproses sebagai poin SKPI.",
    nomorSertifikat: "",
    tautan: "",
  },
  {
    id: 6,
    judul: "Artificial Intelligence for Future Innovation",
    tanggal: "10 Agu 2025",
    lokasi: "Universitas Indonesia",
    kategori: "Seminar",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    dosenPembimbing: "",
    status: "Divalidasi",
    poin: 12,
    catatanValidator: "",
    nomorSertifikat: "",
    tautan: "",
  },
  {
    id: 7,
    judul: "International Robotics Competition 2025",
    tanggal: "05 Nov 2025",
    lokasi: "Singapore Exhibition Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Peserta",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    status: "Belum Diperiksa",
    poin: null,
    catatanValidator: "",
    nomorSertifikat: "",
    tautan: "",
  },
  {
    id: 8,
    judul: "PKKMB Universitas Lampung",
    tanggal: "15 Agu 2022",
    lokasi: "Universitas Lampung",
    kategori: "PKKMB Universitas",
    tingkatan: "Universitas",
    jabatan: "Peserta",
    dosenPembimbing: "",
    status: "Belum Diperiksa",
    poin: null,
    catatanValidator: "",
    nomorSertifikat: "",
    tautan: "",
  },
];

export default function DataSKPIMahasiswa() {
  const navigate = useNavigate();
  const [items, setItems] = useState(initialDataSKPI);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const { isLocked } = useLock();
  const [showDraftModal, setShowDraftModal] = useState(false);

  // Modals state
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [editModalItem, setEditModalItem] = useState(null);

  // Document controls
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const filteredItems = items.filter((item) => {
    const matchSearch = item.judul.toLowerCase().includes(search.toLowerCase());
    const matchCat = kategoriFilter === "Semua Kategori" || item.kategori === kategoriFilter;
    const matchStat = statusFilter === "Semua Status" || item.status === statusFilter;
    return matchSearch && matchCat && matchStat;
  });

  const handleDelete = () => {
    if (!deleteModalItem) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteModalItem.id));
    setDeleteModalItem(null);
  };

  const totalPoinValid = items
    .filter((i) => i.status === "Divalidasi")
    .reduce((acc, curr) => acc + (curr.poin || 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarMahasiswa />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="mahasiswa" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* TOP HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Data SKPI
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Kelola semua kegiatan yang telah diajukan.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isLocked && (
                <button
                  onClick={() => navigate("/tambah-kegiatan")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Tambah Kegiatan</span>
                </button>
              )}

              <button
                onClick={() => {
                  if (!isLocked) {
                    setShowDraftModal(true);
                  } else {
                    navigate("/cetak-skpi");
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Unduh Transkrip</span>
              </button>
            </div>
          </div>

          {/* LOCKED BANNER (EXACT MATCH SCREENSHOT 2) */}
          {isLocked && (
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-800/80 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E02424] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#E02424] dark:text-rose-300">
                  Transkrip SKPI Anda telah dikunci & diterbitkan
                </h3>
                <p className="text-xs text-rose-700 dark:text-rose-300/80 mt-0.5">
                  Data kegiatan tidak dapat diubah atau dihapus. Silakan unduh transkrip final memakai tombol di atas.
                </p>
              </div>
            </div>
          )}

          {/* FILTER & SEARCH BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari kegiatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Pelatihan">Pelatihan</option>
                <option value="Lomba">Lomba</option>
                <option value="Seminar">Seminar</option>
                <option value="Organisasi">Organisasi</option>
                <option value="Publikasi">Publikasi</option>
                <option value="PKKMB Universitas">PKKMB Universitas</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Semua Status">Semua Status</option>
                <option value="Belum Diperiksa">Belum Diperiksa</option>
                <option value="Divalidasi">Divalidasi</option>
                <option value="Ditangguhkan">Ditangguhkan</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* STACKED ACTIVITY CARDS LIST (EXACT MATCH IMAGE 2 SCREENSHOT) */}
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-blue-200 dark:hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={20} />
                    </div>

                    <div className="space-y-2 min-w-0">
                      <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100">
                        {item.judul}
                      </h3>

                      {/* Line 2: Metadata Row */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span>{item.tanggal}</span>
                        </span>

                        {item.lokasi && (
                          <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span>{item.lokasi}</span>
                          </span>
                        )}

                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                            item.kategori === "Pelatihan"
                              ? "bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                              : item.kategori === "Lomba"
                              ? "bg-sky-100/70 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                              : item.kategori === "Seminar"
                              ? "bg-purple-100/70 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                              : item.kategori === "Organisasi"
                              ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-pink-100/70 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"
                          }`}
                        >
                          {item.kategori}
                        </span>

                        <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                          {item.tingkatan}
                        </span>

                        {item.dosenPembimbing && (
                          <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                            Pembimbing: {item.dosenPembimbing}
                          </span>
                        )}
                      </div>

                      {/* Line 3: Status & Poin Row */}
                      <div className="flex items-center gap-3 pt-0.5">
                        {item.status === "Divalidasi" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                            <CheckCircle2 size={13} /> Divalidasi
                          </span>
                        ) : item.status === "Ditangguhkan" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
                            <Clock size={13} /> Ditangguhkan
                          </span>
                        ) : item.status === "Ditolak" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
                            <XCircle size={13} /> Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                            <Clock size={13} /> Belum Diperiksa
                          </span>
                        )}

                        {item.poin !== null && (
                          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                            Poin: <strong className="font-bold text-gray-900 dark:text-slate-100">{item.poin}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top-Right Action Icons */}
                  <div className="flex items-center gap-4 text-gray-400 shrink-0">
                    {item.tautan && (
                      <a
                        href={item.tautan}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-blue-600 transition-colors"
                        title="Buka Tautan"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}

                    <button
                      onClick={() => setDetailModalItem(item)}
                      className="hover:text-blue-600 transition-colors cursor-pointer"
                      title="Detail"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      onClick={() => setEditModalItem(item)}
                      disabled={isLocked || item.status === "Divalidasi" || item.status === "Ditolak"}
                      className="hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={
                        item.status === "Divalidasi"
                          ? "Kegiatan divalidasi tidak dapat diedit"
                          : item.status === "Ditolak"
                          ? "Kegiatan ditolak tidak dapat diedit"
                          : "Edit"
                      }
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => setDeleteModalItem(item)}
                      disabled={isLocked || item.status === "Divalidasi"}
                      className="hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title={item.status === "Divalidasi" ? "Kegiatan divalidasi tidak dapat dihapus" : "Hapus"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* VALIDATOR REVISION INSET ALERT */}
                {item.catatanValidator && (
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-xs space-y-1 mt-3">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">!</span>
                      <span>Catatan dari validator:</span>
                    </div>
                    <p className="text-amber-900 dark:text-amber-200 pl-6">
                      {item.catatanValidator.replace("Catatan dari validator: ", "")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* FOOTER SUMMARY */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-2">
            <span>Menampilkan {filteredItems.length} dari {items.length} kegiatan</span>
            <span className="font-bold text-gray-800 dark:text-slate-200">Total Poin: {totalPoinValid}</span>
          </div>
        </main>
      </div>

      {/* DETAIL KEGIATAN MODAL (EXACT IMAGE 1 MATCH) */}
      {detailModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-100 dark:border-slate-800">
            {/* Left Info Pane */}
            <div className="lg:w-1/2 p-6 overflow-y-auto space-y-5 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 inline-block">
                  DETAIL KEGIATAN
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
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.nama || "NOVIA FITRIANA HUDA"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NPM</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.npm || "2215061024"}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">PROGRAM STUDI</span>
                  <span className="font-extrabold text-gray-900 dark:text-slate-100">Program Studi S1 Teknik Informatika (S1)</span>
                </div>
              </div>

              {/* Card 2: INFORMASI KEGIATAN */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">INFORMASI KEGIATAN</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">KATEGORI</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.kategori}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">JABATAN / PERAN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.jabatan || "Peserta"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">TINGKATAN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.tingkatan}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">TANGGAL SERTIFIKAT</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.tanggal}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NOMOR SERTIFIKAT</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.nomorSertifikat || "SERT/PLT/2025/0192"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">POIN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.poin || 15}</span>
                  </div>
                </div>

                {/* Status Badges Row */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold mr-1">STATUS</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> Divalidasi
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    {detailModalItem.kategori}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {detailModalItem.tingkatan}
                  </span>
                </div>

                {/* Tautan Sertifikat */}
                <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">TAUTAN SERTIFIKAT</span>
                  <a
                    href={detailModalItem.tautan || "https://drive.google.com/contoh-sertifikat"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1"
                  >
                    <ExternalLink size={13} />
                    <span>{detailModalItem.tautan || "https://drive.google.com/contoh-sertifikat"}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Previewer Pane */}
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

      {/* EDIT KEGIATAN MODAL (EXACT MATCH PDF PAGE 9) */}
      {editModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Edit Kegiatan
              </h3>
              <button
                onClick={() => setEditModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setItems((prev) =>
                  prev.map((i) => (i.id === editModalItem.id ? editModalItem : i))
                );
                setEditModalItem(null);
              }}
              className="space-y-4 text-xs"
            >
              {/* Judul Kegiatan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Judul Kegiatan *
                </label>
                <input
                  type="text"
                  value={editModalItem.judul}
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, judul: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Kategori & Tahun */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    Kategori *
                  </label>
                  <select
                    value={editModalItem.kategori}
                    onChange={(e) =>
                      setEditModalItem({ ...editModalItem, kategori: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Pelatihan">Pelatihan</option>
                    <option value="Lomba">Lomba</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Publikasi">Publikasi</option>
                    <option value="PKKMB Universitas">PKKMB Universitas</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    Tahun *
                  </label>
                  <select
                    value={editModalItem.tahun || "2025"}
                    onChange={(e) =>
                      setEditModalItem({ ...editModalItem, tahun: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Row: Lomba vs General */}
              {editModalItem.kategori === "Lomba" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Prestasi / Pencapaian
                      </label>
                      <select
                        value={editModalItem.jabatan || "Peserta"}
                        onChange={(e) =>
                          setEditModalItem({ ...editModalItem, jabatan: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Juara 1">Juara 1</option>
                        <option value="Juara 2">Juara 2</option>
                        <option value="Juara 3">Juara 3</option>
                        <option value="Harapan 1">Harapan 1</option>
                        <option value="Finalis">Finalis</option>
                        <option value="Peserta">Peserta</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Tingkatan
                      </label>
                      <select
                        value={editModalItem.tingkatan}
                        onChange={(e) =>
                          setEditModalItem({ ...editModalItem, tingkatan: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Fakultas">Fakultas</option>
                        <option value="Universitas">Universitas</option>
                        <option value="Regional">Regional</option>
                        <option value="Nasional">Nasional</option>
                        <option value="Internasional">Internasional</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Dosen Pembimbing *
                    </label>
                    <select
                      value={editModalItem.dosenPembimbing || "Dr. Eng. Admi Syarif"}
                      onChange={(e) =>
                        setEditModalItem({ ...editModalItem, dosenPembimbing: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Dr. Eng. Admi Syarif">Dr. Eng. Admi Syarif</option>
                      <option value="Prof. Dr. Ir. Admi Syarif">Prof. Dr. Ir. Admi Syarif</option>
                      <option value="Dr. Ir. Gigih Forda Nama, S.T., M.T.">Dr. Ir. Gigih Forda Nama, S.T., M.T.</option>
                    </select>
                  </div>

                  {/* Anggota Tim */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Anggota Tim (opsional)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nama anggota"
                        className="p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="NPM"
                        className="p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Tambah Anggota</span>
                    </button>
                  </div>

                  {/* Unggah SK Pembimbing / Tim */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Unggah SK Pembimbing / Tim
                    </label>
                    <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                      <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                        <Upload size={18} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                        Klik untuk unggah atau tarik berkas ke sini
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, atau PDF</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Jabatan
                    </label>
                    <select
                      value={editModalItem.jabatan || "Peserta"}
                      onChange={(e) =>
                        setEditModalItem({ ...editModalItem, jabatan: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Peserta">Peserta</option>
                      <option value="Ketua">Ketua</option>
                      <option value="Wakil Ketua">Wakil Ketua</option>
                      <option value="Anggota">Anggota</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Tingkatan
                    </label>
                    <select
                      value={editModalItem.tingkatan}
                      onChange={(e) =>
                        setEditModalItem({ ...editModalItem, tingkatan: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Fakultas">Fakultas</option>
                      <option value="Universitas">Universitas</option>
                      <option value="Regional">Regional</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Nomor Sertifikat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Nomor Sertifikat
                </label>
                <input
                  type="text"
                  value={editModalItem.nomorSertifikat || ""}
                  placeholder="Masukkan nomor sertifikat"
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, nomorSertifikat: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Tanggal Sertifikat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Tanggal Sertifikat
                </label>
                <input
                  type="text"
                  value={editModalItem.tanggal || ""}
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, tanggal: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Tautan Sertifikat */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Tautan Sertifikat
                </label>
                <input
                  type="url"
                  value={editModalItem.tautan || ""}
                  placeholder="https://..."
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, tautan: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Unggah Dokumen Pendukung */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                  Unggah Dokumen Pendukung
                </label>
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-gray-50/50 dark:bg-slate-800/40 hover:border-blue-500 transition-colors cursor-pointer">
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                    Klik untuk unggah atau tarik berkas ke sini
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, PDF (maks. 5MB)</p>
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={28} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Konfirmasi Hapus</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                Yakin ingin menghapus <span className="font-bold text-gray-800 dark:text-slate-200">"{deleteModalItem.judul}"</span>? Tindakan ini tidak dapat dibatalkan.
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

      {/* MODAL TRANSKRIP BELUM FINAL (EXACT MATCH SCREENSHOT) */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="fixed inset-0"
            onClick={() => setShowDraftModal(false)}
          />
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-800 text-center relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center mx-auto mb-5">
              <Lock size={28} className="text-[#FF9900]" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-slate-100">
              Transkrip Belum Final
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-3 leading-relaxed px-2">
              SKPI Anda masih dalam status draf dan belum dikunci oleh Program Studi. Anda belum dapat mengunduh transkrip final.
            </p>

            <button
              onClick={() => setShowDraftModal(false)}
              className="w-full py-3 px-4 rounded-2xl bg-[#FF9900] hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-colors cursor-pointer mt-6"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
