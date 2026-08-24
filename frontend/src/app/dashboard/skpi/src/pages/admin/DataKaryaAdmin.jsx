// src/pages/admin/DataKaryaAdmin.jsx
import React, { useState } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import Navbar from "../../components/common/Navbar";
import {
  Search,
  Eye,
  Users,
  Folder,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  FileText,
  ExternalLink,
  Award,
  User,
  ChevronLeft,
} from "lucide-react";

const karyaAdminData = [
  {
    id: 1,
    nama: "Hanifa Azzahra",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    totalKaryaCount: 1,
    karyaList: [
      {
        id: 101,
        judul: "Desain UI/UX Aplikasi Akademik MyUnila",
        kategori: "Karya",
        bentukKarya: "Karya Seni / Desain",
        tanggal: "20 Nov 2025",
        tautan: "https://dribbble.com/sample",
      },
    ],
  },
  {
    id: 2,
    nama: "Eko Prasetyo",
    npm: "202110005",
    programStudi: "Sistem Informasi",
    totalKaryaCount: 1,
    karyaList: [
      {
        id: 102,
        judul: "Aplikasi Monitoring Energi Terbarukan",
        kategori: "Karya",
        bentukKarya: "Aplikasi / Software",
        tanggal: "10 Jun 2025",
        tautan: "https://github.com/sample2",
      },
    ],
  },
];

export default function DataKaryaAdmin() {
  const [search, setSearch] = useState("");
  const [prodiFilter, setProdiFilter] = useState("Semua Prodi");
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [activeKaryaIndex, setActiveKaryaIndex] = useState(0);

  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const filteredData = karyaAdminData.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.npm.includes(search) ||
      item.karyaList.some((k) => k.judul.toLowerCase().includes(search.toLowerCase()));
    const matchProdi = prodiFilter === "Semua Prodi" || item.programStudi === prodiFilter;
    return matchSearch && matchProdi;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER */}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Data Karya Mahasiswa
            </h1>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Telusuri karya dan portofolio yang diunggah mahasiswa.
            </p>
          </div>

          {/* STAT METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase">
                <Users size={16} />
                <span>TOTAL MAHASISWA</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight mt-3">2</div>
              <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                <Users size={80} />
              </div>
            </div>

            <div className="lg:col-span-2 bg-gradient-to-r from-purple-600 via-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase">
                <Folder size={16} />
                <span>TOTAL KARYA</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight mt-3">2</div>
              <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                <Folder size={80} />
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER CARD (EXACT MATCH DASHBOARD DOSEN & USER SCREENSHOT) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Daftar Karya Mahasiswa
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, NPM, atau judul karya..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <select
                  value={prodiFilter}
                  onChange={(e) => setProdiFilter(e.target.value)}
                  className="px-3.5 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
                >
                  <option value="Semua Prodi">Semua Prodi</option>
                  <option value="Sistem Informasi">Sistem Informasi</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4">MAHASISWA</th>
                    <th className="py-3.5 px-4">PROGRAM STUDI</th>
                    <th className="py-3.5 px-4 text-center">KARYA</th>
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
                          {row.totalKaryaCount}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedStudentDetail(row);
                            setActiveKaryaIndex(0);
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

          <div className="text-xs text-gray-400 dark:text-slate-500 pl-1">
            Menampilkan {filteredData.length} dari {karyaAdminData.length} mahasiswa
          </div>
        </main>
      </div>

      {/* DETAIL KARYA MAHASISWA MODAL (EXACT IMAGE 3 MATCH) */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-gray-100 dark:border-slate-800 relative">
            {/* Left Info Pane */}
            <div className="lg:w-1/2 p-6 overflow-y-auto space-y-5 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 inline-block">
                  DETAIL KARYA MAHASISWA
                </span>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-slate-100 mt-2">
                  {selectedStudentDetail.nama}
                </h2>
              </div>

              {/* Card 1: PROFIL MAHASISWA */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <User size={13} className="text-blue-600 dark:text-blue-400" />
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

              {/* Card 2: DAFTAR KARYA MAHASISWA */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <Award size={13} className="text-blue-600 dark:text-blue-400" />
                  <span>DAFTAR KARYA MAHASISWA</span>
                </div>

                <div className="border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-800/50 p-2.5 font-bold text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-slate-800">
                    <span className="col-span-6">JUDUL KARYA</span>
                    <span className="col-span-4">BENTUK KARYA</span>
                    <span className="col-span-2 text-right">TAUTAN</span>
                  </div>

                  {selectedStudentDetail.karyaList.map((karya, idx) => (
                    <div
                      key={karya.id}
                      onClick={() => setActiveKaryaIndex(idx)}
                      className={`grid grid-cols-12 p-3 items-center cursor-pointer transition-colors ${
                        activeKaryaIndex === idx
                          ? "bg-blue-50/80 dark:bg-blue-950/60 font-bold text-blue-900 dark:text-blue-200"
                          : "hover:bg-gray-50/60 dark:hover:bg-slate-800/40 text-gray-700 dark:text-slate-300"
                      }`}
                    >
                      <span className="col-span-6 font-bold">{karya.judul}</span>
                      <span className="col-span-4 text-gray-500 font-medium">{karya.bentukKarya}</span>
                      <span className="col-span-2 text-right text-blue-600 font-bold text-[11px]">Link</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 pl-1">
                  {selectedStudentDetail.karyaList.length} karya · pilih baris untuk melihat detail & lampirannya
                </p>
              </div>

              {/* Card 3: INFO KARYA */}
              {selectedStudentDetail.karyaList[activeKaryaIndex] && (
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3 border border-gray-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                    <span>INFO KARYA: {selectedStudentDetail.karyaList[activeKaryaIndex].judul.toUpperCase()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">KATEGORI</span>
                      <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.karyaList[activeKaryaIndex].kategori}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">BENTUK KARYA</span>
                      <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.karyaList[activeKaryaIndex].bentukKarya}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">TANGGAL PEMBUATAN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{selectedStudentDetail.karyaList[activeKaryaIndex].tanggal}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                    <a
                      href={selectedStudentDetail.karyaList[activeKaryaIndex].tautan}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <ExternalLink size={13} />
                      <span>Tautan karya / portofolio</span>
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
                    <span>Lampiran Pendukung ({selectedStudentDetail.karyaList[activeKaryaIndex]?.judul})</span>
                  </div>
                  <button onClick={() => setSelectedStudentDetail(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
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
                    onClick={() => alert("Mengunduh berkas...")}
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
