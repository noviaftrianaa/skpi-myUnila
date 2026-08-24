// src/pages/dosen/DashboardDosen.jsx
import React, { useState } from "react";
import SidebarDosen from "../../components/common/SidebarDosen";
import Navbar from "../../components/common/Navbar";
import {
  Search,
  Eye,
  Users,
  Award,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  ExternalLink,
  CheckCircle2,
  User,
  Folder,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

function ThreeUsersIcon({ size = 18, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top Center Head */}
      <circle cx="12" cy="6" r="2.5" />
      {/* Left Head */}
      <circle cx="6.5" cy="10.5" r="2.2" />
      {/* Right Head */}
      <circle cx="17.5" cy="10.5" r="2.2" />
      {/* Wide Bottom Body Arc */}
      <path d="M4 20c0-4.2 3.8-6.5 8-6.5s8 2.3 8 6.5" />
    </svg>
  );
}

const bimbinganData = [
  {
    id: 1,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    kegiatanCount: 2,
    totalPoin: 35,
    kegiatanList: [
      {
        id: 201,
        judul: "International IoT Challenge",
        tingkatan: "Internasional",
        poin: 25,
        peran: "Juara 3",
        tanggal: "20 Jul 2025",
        lokasi: "Kuala Lumpur Convention Centre",
        nomorSertifikat: "SERT/LMB/2025/0233",
        status: "Divalidasi",
        tautan: "https://example.com/cert",
      },
      {
        id: 202,
        judul: "Regional UI/UX Design Competition",
        tingkatan: "Regional",
        poin: 10,
        peran: "Juara 1",
        tanggal: "12 Jun 2025",
        lokasi: "Bandung",
        nomorSertifikat: "SERT/LMB/2025/0111",
        status: "Divalidasi",
        tautan: "",
      },
    ],
  },
  {
    id: 2,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    kegiatanCount: 1,
    totalPoin: 20,
    kegiatanList: [
      {
        id: 203,
        judul: "National Coding Competition 2025",
        tingkatan: "Nasional",
        poin: 20,
        peran: "Juara 2",
        tanggal: "20 Okt 2025",
        lokasi: "Jakarta",
        nomorSertifikat: "SERT/LMB/2025/0451",
        status: "Divalidasi",
        tautan: "",
      },
    ],
  },
];

export default function DashboardDosen() {
  const [search, setSearch] = useState("");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [activeKegiatanIndex, setActiveKegiatanIndex] = useState(0);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const filteredData = bimbinganData.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.npm.includes(search)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarDosen />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="dosen" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                Mahasiswa Bimbingan
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Capaian mahasiswa bimbingan Anda yang sudah divalidasi admin.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-gray-700 bg-white dark:bg-slate-900 dark:text-slate-200 border border-gray-200 dark:border-slate-800 shadow-2xs self-start sm:self-auto">
              <GraduationCap size={15} className="text-blue-600" />
              <span>Admi Syarif</span>
            </div>
          </div>

          {/* STAT METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase">
                <Users size={16} />
                <span>MAHASISWA BIMBINGAN</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight mt-3">2</div>
              <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                <Users size={80} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-r from-purple-600 via-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase">
                <Folder size={16} />
                <span>KEGIATAN TERVALIDASI</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight mt-3">3</div>
              <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                <Folder size={80} />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER CARD (EXACT MATCH IMAGE 1 SCREENSHOT) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Daftar Mahasiswa Bimbingan
              </h2>

              <div className="relative w-full sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NPM..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4">MAHASISWA</th>
                    <th className="py-3.5 px-4">PROGRAM STUDI</th>
                    <th className="py-3.5 px-4 text-center">KEGIATAN</th>
                    <th className="py-3.5 px-4 text-center">TOTAL POIN</th>
                    <th className="py-3.5 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60 text-xs">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900 dark:text-slate-100">{row.nama}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{row.npm}</div>
                      </td>

                      <td className="py-4 px-4 text-gray-700 dark:text-slate-300 font-medium">
                        {row.programStudi}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-bold text-xs">
                          {row.kegiatanCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-extrabold text-gray-900 dark:text-slate-100">
                        {row.totalPoin}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentDetail(row);
                            setActiveKegiatanIndex(0);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors text-xs font-semibold cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Lihat Detail</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL PRESTASI BIMBINGAN MODAL (EXACT MATCH IMAGE 2 SCREENSHOT) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-100 dark:border-slate-800 relative">
            {/* Floating Right Arrow Button */}
            <button
              onClick={() => setActiveKegiatanIndex((prev) => (prev + 1) % selectedStudentDetail.kegiatanList.length)}
              className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 shadow-md border border-gray-200 dark:border-slate-700 items-center justify-center text-gray-600 dark:text-slate-300 absolute right-[-18px] top-1/2 -translate-y-1/2 z-20 hover:bg-gray-50 cursor-pointer hidden lg:flex"
              title="Kegiatan Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>

            {/* Left Info Pane */}
            <div className="lg:w-1/2 p-6 overflow-y-auto space-y-5 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 inline-block">
                  DETAIL PRESTASI BIMBINGAN
                </span>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 mt-2">
                  {selectedStudentDetail.nama}
                </h2>
              </div>

              {/* Card 1: PROFIL MAHASISWA */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <User size={13} className="text-blue-600" />
                  <span>PROFIL MAHASISWA</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NPM</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.npm}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">PROGRAM STUDI</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.programStudi}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: DAFTAR KEGIATAN LOMBA */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <Award size={13} className="text-blue-600" />
                  <span>DAFTAR KEGIATAN LOMBA</span>
                </div>

                <div className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-800/50 p-2.5 font-bold text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-slate-800">
                    <span className="col-span-6">JUDUL LOMBA</span>
                    <span className="col-span-4 text-center">TINGKAT</span>
                    <span className="col-span-2 text-right">POIN</span>
                  </div>

                  {selectedStudentDetail.kegiatanList.map((keg, idx) => (
                    <div
                      key={keg.id}
                      onClick={() => setActiveKegiatanIndex(idx)}
                      className={`grid grid-cols-12 p-3 items-center cursor-pointer transition-colors ${
                        activeKegiatanIndex === idx
                          ? "bg-blue-50/80 dark:bg-blue-950/60 font-bold text-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-50/60 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="col-span-6 font-bold">{keg.judul}</span>
                      <span className="col-span-4 text-center text-gray-500 font-medium">{keg.tingkatan}</span>
                      <span className="col-span-2 text-right text-blue-600 font-extrabold">{keg.poin}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 pl-1">
                  {selectedStudentDetail.kegiatanList.length} kegiatan · pilih baris untuk melihat detail & lampirannya
                </p>
              </div>

              {/* Card 3: INFO LENGKAP */}
              {selectedStudentDetail.kegiatanList[activeKegiatanIndex] && (
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <FileText size={13} className="text-blue-600" />
                    <span>INFO LENGKAP: {selectedStudentDetail.kegiatanList[activeKegiatanIndex].judul.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">PERAN / JABATAN</span>
                      <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.kegiatanList[activeKegiatanIndex].peran}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">TANGGAL</span>
                      <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.kegiatanList[activeKegiatanIndex].tanggal}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">LOKASI</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.kegiatanList[activeKegiatanIndex].lokasi || "—"}</span>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NOMOR SERTIFIKAT</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.kegiatanList[activeKegiatanIndex].nomorSertifikat}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold mb-1">STATUS</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} /> Divalidasi
                      </span>
                    </div>

                    <a
                      href={selectedStudentDetail.kegiatanList[activeKegiatanIndex].tautan || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px] self-end mb-1"
                    >
                      <ExternalLink size={12} />
                      <span>Tautan sertifikat</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Previewer Pane */}
            <div className="lg:w-1/2 p-6 flex flex-col justify-between bg-gray-50/50 dark:bg-slate-950">
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-slate-200">
                    <FileText size={16} className="text-blue-600" />
                    <span>Lampiran Sertifikat ({selectedStudentDetail.kegiatanList[activeKegiatanIndex]?.judul})</span>
                  </div>
                  <button onClick={() => setSelectedStudentDetail(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                {/* Controls Bar & Download Button */}
                <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 mb-4 px-1">
                  <div className="flex items-center gap-3">
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

                  <button
                    onClick={() => alert("Mengunduh sertifikat...")}
                    className="px-4 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Unduh</span>
                  </button>
                </div>

                {/* Center Preview Box */}
                <div className="min-h-[260px] bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center text-gray-400">
                  <FileText size={48} className="mb-2 opacity-25" />
                  <p className="text-xs font-medium">Dokumen lampiran belum diunggah dalam bentuk berkas.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
