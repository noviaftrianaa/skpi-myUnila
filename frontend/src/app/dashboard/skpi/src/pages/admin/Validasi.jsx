// src/pages/admin/Validasi.jsx
import React, { useState } from "react";
import SidebarAdmin from "../../components/common/SidebarAdmin";
import Navbar from "../../components/common/Navbar";
import { KATEGORI_OPTIONS, KATEGORI_BADGE_STYLE, getTingkatanOptions, getJabatanOptions, PRESTASI_LOMBA_OPTIONS } from "../../constants/categories";
import { useLock } from "../../contexts/LockContext";
import {
  Search,
  Eye,
  Check,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Lock,
  Unlock,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Pencil,
  FileText,
  Award,
  User,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Inbox,
} from "lucide-react";

const initialKegiatanData = [
  {
    id: 1,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    kegiatan: "National Coding Competition 2025",
    tanggal: "20 Okt 2025",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Juara 2",
    nomorSertifikat: "SERT/LMB/2025/0451",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "https://drive.google.com/contoh-koding",
    poin: 0,
    status: "Belum Diperiksa",
    catatanRevisi: "",
  },
  {
    id: 2,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    kegiatan: "Seminar AI & Machine Learning",
    tanggal: "22 Okt 2025",
    kategori: "Seminar",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "SERT/SEM/2025/0112",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 12,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 3,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    kegiatan: "Digital Innovation Summit",
    tanggal: "18 Okt 2025",
    kategori: "Seminar",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "SERT/SEM/2025/0901",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Ditangguhkan",
    catatanRevisi: "Revisi: Nama pada sertifikat berbeda dengan data mahasiswa. Mohon unggah ulang sertifikat yang sesuai.",
  },
  {
    id: 4,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    kegiatan: "Regional Line Follower Competition",
    tanggal: "25 Okt 2025",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Belum Diperiksa",
    catatanRevisi: "",
  },
  {
    id: 5,
    nama: "Budi Santoso",
    npm: "202110003",
    programStudi: "Teknik Informatika",
    kegiatan: "Ketua BEM Universitas Lampung",
    tanggal: "01 Sep 2025",
    kategori: "Organisasi",
    tingkatan: "Universitas",
    jabatan: "Ketua",
    nomorSertifikat: "SK/ORG/2025/001",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 25,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 6,
    nama: "Dewi Lestari",
    npm: "202110004",
    programStudi: "Teknik Informatika",
    kegiatan: "UI/UX Design Workshop",
    tanggal: "15 Okt 2025",
    kategori: "Pelatihan",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Belum Diperiksa",
    catatanRevisi: "",
  },
  {
    id: 7,
    nama: "Dewi Lestari",
    npm: "202110004",
    programStudi: "Teknik Informatika",
    kegiatan: "National Smart City Competition",
    tanggal: "18 Sep 2025",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Ditolak",
    catatanRevisi: "Berkualifikasi tidak sesuai kriteria.",
  },
  {
    id: 8,
    nama: "Eko Prasetyo",
    npm: "202110005",
    programStudi: "Sistem Informasi",
    kegiatan: "Dasar Keamanan Siber",
    tanggal: "10 Okt 2025",
    kategori: "Seminar",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 8,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 9,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    kegiatan: "International IoT Challenge",
    tanggal: "20 Jul 2025",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Juara 3",
    nomorSertifikat: "SERT/LMB/2025/0233",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 25,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 99,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    kegiatan: "PKKMB Universitas Lampung",
    tanggal: "15 Agt 2021",
    kategori: "PKKMB Universitas",
    tingkatan: "Universitas",
    jabatan: "Peserta",
    nomorSertifikat: "SERT/PKKMB/2021/0012",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 25,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 10,
    nama: "Hanifa Azzahra",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    kegiatan: "National Hackathon 2025",
    tanggal: "15 Okt 2025",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Belum Diperiksa",
    catatanRevisi: "",
  },
  {
    id: 11,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    kegiatan: "International Web Design Competition",
    tanggal: "12 Nov 2025",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Finalis",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 20,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 12,
    nama: "Budi Santoso",
    npm: "202110003",
    programStudi: "Teknik Informatika",
    kegiatan: "Community Service Program",
    tanggal: "05 Okt 2025",
    kategori: "Kepanitiaan",
    tingkatan: "Universitas",
    jabatan: "Ketua Pelaksana",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Belum Diperiksa",
    catatanRevisi: "",
  },
  {
    id: 13,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    kegiatan: "Regional UI/UX Design Competition",
    tanggal: "12 Jun 2025",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Juara 1",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: 10,
    status: "Divalidasi",
    catatanRevisi: "",
  },
  {
    id: 14,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    kegiatan: "Pelatihan Public Speaking",
    tanggal: "25 Okt 2025",
    kategori: "Pelatihan",
    tingkatan: "Universitas",
    jabatan: "Peserta",
    nomorSertifikat: "",
    dosenPembimbing: "Dr. Eng. Admi Syarif",
    tautanSertifikat: "",
    poin: null,
    status: "Ditangguhkan",
    catatanRevisi: "Revisi: Sertifikat belum diunggah. Mohon lengkapi berkas pendukung.",
  },
];

function CategoryBadge({ category }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        KATEGORI_BADGE_STYLE[category] || "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {category}
    </span>
  );
}

function StatusBadge({ status }) {
  if (status === "Divalidasi") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
        <CheckCircle2 size={12} /> Divalidasi
      </span>
    );
  }
  if (status === "Ditangguhkan") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
        <Clock size={12} /> Ditangguhkan
      </span>
    );
  }
  if (status === "Ditolak") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
        <XCircle size={12} /> Ditolak
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
      <Clock size={12} /> Belum Diperiksa
    </span>
  );
}

export default function ValidasiAdmin() {
  const [data, setData] = useState(initialKegiatanData);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua Kategori");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { lockedStudents, toggleLock: toggleLockStatus } = useLock();

  // Modals state
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [validateModalItem, setValidateModalItem] = useState(null);
  const [pointInput, setPointInput] = useState(15);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [actionType, setActionType] = useState("ditangguhkan");
  const [revisiNote, setRevisiNote] = useState("");
  const [editModalItem, setEditModalItem] = useState(null);

  // Document preview controls
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);

  const filteredData = data.filter((item) => {
    if (item.status === "Ditolak") return false;
    if (selectedStudent && item.nama !== selectedStudent.nama) return false;
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.npm.includes(search) ||
      item.kegiatan.toLowerCase().includes(search.toLowerCase());
    const matchKategori =
      kategoriFilter === "Semua Kategori" || item.kategori === kategoriFilter;
    const matchStatus =
      statusFilter === "Semua Status" || item.status === statusFilter;
    return matchSearch && matchKategori && matchStatus;
  });

  const handleValidasi = () => {
    if (!validateModalItem) return;
    setData((prev) =>
      prev.map((item) =>
        item.id === validateModalItem.id
          ? {
              ...item,
              status: "Divalidasi",
              poin: Number(pointInput),
              catatanRevisi: "",
            }
          : item
      )
    );
    setValidateModalItem(null);
  };

  const handleRejectOrSuspend = () => {
    if (!rejectModalItem) return;
    if (actionType === "tolak" || actionType === "ditolak") {
      setData((prev) =>
        prev.map((item) =>
          item.id === rejectModalItem.id
            ? {
                ...item,
                status: "Ditolak",
                poin: null,
                catatanRevisi: revisiNote,
              }
            : item
        )
      );
    } else {
      setData((prev) =>
        prev.map((item) =>
          item.id === rejectModalItem.id
            ? {
                ...item,
                status: "Ditangguhkan",
                poin: null,
                catatanRevisi: revisiNote,
              }
            : item
        )
      );
    }
    setRejectModalItem(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-poppins transition-colors duration-200">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role="admin" />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* HEADER / BREADCRUMB */}
          {selectedStudent ? (
            <div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Validasi Kegiatan</span>
              </button>

              {/* STUDENT PROFILE CARD */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-slate-800 shadow-xs mb-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      <User size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                        {selectedStudent?.nama}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">
                        {selectedStudent?.npm} · {selectedStudent?.programStudi}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 self-start sm:self-auto">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border ${
                        lockedStudents[selectedStudent?.nama]
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      }`}
                    >
                      {lockedStudents[selectedStudent?.nama] ? <Lock size={14} /> : <Unlock size={14} />}
                      {lockedStudents[selectedStudent?.nama] ? "SKPI final terkunci" : "SKPI final terbuka"}
                    </span>

                    <button
                      onClick={() => {
                        const studentNama = selectedStudent?.nama;
                        if (!lockedStudents[studentNama]) {
                          const studentActivities = data.filter(
                            (k) => k.nama === studentNama || k.npm === selectedStudent?.npm
                          );
                          const totalValidPoin = studentActivities
                            .filter((k) => k.status === "Divalidasi")
                            .reduce((acc, curr) => acc + (curr.poin || 0), 0);
                          const hasPKKMB = studentActivities.some(
                            (k) => k.kategori === "PKKMB Universitas"
                          );

                          if (totalValidPoin < 25 || !hasPKKMB) {
                            const reasons = [];
                            if (totalValidPoin < 25)
                              reasons.push(
                                `Total poin divalidasi baru ${totalValidPoin} (minimal 25 poin)`
                              );
                            if (!hasPKKMB)
                              reasons.push(
                                "Kegiatan PKKMB Universitas belum dilampirkan/divalidasi"
                              );

                            const confirmLock = window.confirm(
                              `Perhatian - Syarat SKPI belum lengkap:\n- ${reasons.join(
                                "\n- "
                              )}\n\nApakah Anda (Admin) tetap ingin mengunci (lock) SKPI final mahasiswa ini secara manual?`
                            );
                            if (!confirmLock) return;
                          }
                        }
                        toggleLockStatus(studentNama);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-colors cursor-pointer ${
                        lockedStudents[selectedStudent?.nama]
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      <Lock size={14} />
                      {lockedStudents[selectedStudent?.nama] ? "Buka kunci" : "Kunci SKPI final"}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 dark:text-slate-500 pt-2 font-medium">
                  {lockedStudents[selectedStudent?.nama]
                    ? "Transkrip terkunci — mahasiswa tidak dapat menambah atau mengubah kegiatan, dan validasi baru tidak diproses."
                    : "Transkrip terbuka — mahasiswa masih dapat mengajukan kegiatan baru."}
                </p>
              </div>

              {/* 4 STUDENT STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* CARD 1: TOTAL POIN */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase z-10 relative">
                    <Award size={16} />
                    <span>TOTAL POIN</span>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mt-3 z-10 relative">
                    {data.filter((d) => d.nama === selectedStudent?.nama && d.status === "Divalidasi").reduce((acc, curr) => acc + (curr.poin || 0), 0)}
                  </div>
                  <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                    <Award size={80} />
                  </div>
                </div>

                {/* CARD 2: DIVALIDASI */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase z-10 relative">
                    <CheckCircle2 size={16} />
                    <span>DIVALIDASI</span>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mt-3 z-10 relative">
                    {data.filter((d) => d.nama === selectedStudent?.nama && d.status === "Divalidasi").length}
                  </div>
                  <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                    <CheckCircle2 size={80} />
                  </div>
                </div>

                {/* CARD 3: PERLU DITINDAKLANJUTI */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase z-10 relative">
                    <Clock size={16} />
                    <span>PERLU DITINDAKLANJUTI</span>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mt-3 z-10 relative">
                    {data.filter((d) => d.nama === selectedStudent?.nama && d.status === "Ditangguhkan").length}
                  </div>
                  <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                    <Clock size={80} />
                  </div>
                </div>

                {/* CARD 4: TOTAL KEGIATAN */}
                <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[110px] transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider opacity-90 uppercase z-10 relative">
                    <Inbox size={16} />
                    <span>TOTAL KEGIATAN</span>
                  </div>
                  <div className="text-4xl font-extrabold tracking-tight mt-3 z-10 relative">
                    {data.filter((d) => d.nama === selectedStudent?.nama).length}
                  </div>
                  <div className="absolute -right-2 -top-2 opacity-15 pointer-events-none">
                    <Inbox size={80} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                  Validasi Kegiatan Mahasiswa
                </h1>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Tinjau dan tetapkan status kegiatan yang diajukan mahasiswa.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                <Clock size={14} className="text-amber-600" />
                <span>7 menunggu tindakan</span>
              </button>
            </div>
          )}

          {/* FILTER & SEARCH BAR */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NPM, atau kegiatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {KATEGORI_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
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

          {/* TABLE OF ACTIVITIES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-800 text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                    <th className="py-3.5 px-4">MAHASISWA</th>
                    <th className="py-3.5 px-4">KEGIATAN</th>
                    <th className="py-3.5 px-4">KATEGORI</th>
                    <th className="py-3.5 px-4 text-center">POIN</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-center">DETAIL</th>
                    <th className="py-3.5 px-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/60 text-xs">
                  {filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedStudent({ nama: row.nama, npm: row.npm, programStudi: row.programStudi })}
                          className="font-bold text-gray-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 text-left cursor-pointer"
                        >
                          {row.nama}
                        </button>
                        <div className="text-[11px] text-gray-400 mt-0.5">{row.npm}</div>
                        <div className="text-[11px] text-gray-400">{row.programStudi}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-800 dark:text-slate-200">{row.kegiatan}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{row.tanggal}</div>

                        {row.status === "Ditangguhkan" && row.catatanRevisi && (
                          <div className="mt-1.5 p-2.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 max-w-sm">
                            {row.catatanRevisi}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <CategoryBadge category={row.kategori} />
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                        {row.poin !== null ? row.poin : "—"}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setDetailModalItem(row)}
                          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline cursor-pointer"
                        >
                          <Eye size={15} />
                          <span>Tampilkan</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2 justify-center">
                          {/* 1. Pencil Edit Icon */}
                          <button
                            onClick={() => setEditModalItem(row)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="Edit Kegiatan"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* 2. Green Check Validate Button */}
                          <button
                            onClick={() => {
                              setValidateModalItem(row);
                              setPointInput(row.poin || 15);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white cursor-pointer shadow-2xs transition-colors ${
                              row.status === "Divalidasi"
                                ? "bg-emerald-600 hover:bg-emerald-700"
                                : "bg-emerald-500 hover:bg-emerald-600"
                            }`}
                            title="Validasi & Beri Poin"
                          >
                            <Check size={16} />
                          </button>

                          {/* 3. Red Cross Reject Button */}
                          <button
                            onClick={() => setRejectModalItem(row)}
                            className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                            title="Tolak / Tangguhkan"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50/50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 text-xs text-gray-400">
              Menampilkan {filteredData.length} kegiatan
            </div>
          </div>
        </main>
      </div>

      {/* DETAIL KEGIATAN MODAL (EXACT IMAGE 4 MATCH) */}
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
                  {detailModalItem.kegiatan}
                </h2>
              </div>

              {/* Card 1: PROFIL MAHASISWA */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 border border-gray-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">PROFIL MAHASISWA</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NAMA</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.nama}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NPM</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.npm}</span>
                  </div>
                </div>
                <div className="pt-1 text-xs">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">PROGRAM STUDI</span>
                  <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.programStudi}</span>
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
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.jabatan || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">TINGKATAN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.tingkatan || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">TANGGAL SERTIFIKAT</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.tanggal}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">NOMOR SERTIFIKAT</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.nomorSertifikat || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">POIN</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.poin || 0}</span>
                  </div>
                </div>

                {detailModalItem.dosenPembimbing && (
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">DOSEN PEMBIMBING</span>
                    <span className="font-extrabold text-gray-900 dark:text-slate-100">{detailModalItem.dosenPembimbing}</span>
                  </div>
                )}

                {/* Status Badges Row */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold mr-1">STATUS</span>
                  <StatusBadge status={detailModalItem.status} />
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {detailModalItem.kategori}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {detailModalItem.tingkatan}
                  </span>
                </div>

                {/* Tautan Sertifikat */}
                <div className="pt-2 border-t border-gray-200/60 dark:border-slate-700/60">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">TAUTAN SERTIFIKAT</span>
                  <a
                    href={detailModalItem.tautanSertifikat || "https://drive.google.com/contoh-koding"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-1"
                  >
                    <ExternalLink size={13} />
                    <span>{detailModalItem.tautanSertifikat || "https://drive.google.com/contoh-koding"}</span>
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

      {/* MODAL 2: VALIDASI & BERI POIN (EXACT MATCH SCREENSHOT) */}
      {validateModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-4 text-left relative z-10 animate-in zoom-in-95 duration-200">
            {/* Header: Icon + Titles */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-gray-900 dark:text-slate-100">
                  Validasi Kegiatan
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                  {validateModalItem.nama} · {validateModalItem.kegiatan}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800">
                {validateModalItem.kategori}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800">
                {validateModalItem.tingkatan || "Nasional"}
              </span>
            </div>

            {/* Point Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-gray-800 dark:text-slate-200">
                Poin SKPI <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={pointInput}
                onChange={(e) => setPointInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 dark:text-slate-500 leading-relaxed">
                Saran otomatis berdasarkan tingkatan kegiatan. Sesuaikan bila perlu.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setValidateModalItem(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleValidasi}
                className="px-5 py-2.5 rounded-xl bg-[#008A5E] hover:bg-emerald-700 text-xs font-bold text-white shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check size={16} />
                <span>Validasi & Beri Poin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TOLAK / TANGGUHKAN */}
      {rejectModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Tolak / Tangguhkan</h3>
              <button onClick={() => setRejectModalItem(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400">
              Tindakan untuk kegiatan <span className="font-bold text-gray-900 dark:text-slate-100">{rejectModalItem.kegiatan}</span>.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActionType("ditangguhkan")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  actionType === "ditangguhkan"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                  <Clock size={16} />
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100">Ditangguhkan</div>
                <div className="text-[10px] text-gray-400 mt-1">Perlu revisi, mahasiswa dapat mengajukan ulang.</div>
              </button>

              <button
                type="button"
                onClick={() => setActionType("tolak")}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  actionType === "tolak"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                  <XCircle size={16} />
                </div>
                <div className="text-xs font-bold text-gray-900 dark:text-slate-100">Tolak Permanen</div>
                <div className="text-[10px] text-gray-400 mt-1">Ditolak final dan tidak dapat diubah lagi.</div>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                Catatan {actionType === "ditangguhkan" ? "Revisi *" : "Penolakan"}
              </label>
              <textarea
                rows={3}
                value={revisiNote}
                onChange={(e) => setRevisiNote(e.target.value)}
                placeholder="Sebutkan bagian yang perlu diperbaiki mahasiswa..."
                className="w-full p-3 border border-gray-200 dark:border-slate-700 rounded-xl text-xs bg-gray-50 dark:bg-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleRejectOrSuspend}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${
                  actionType === "ditangguhkan" ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actionType === "ditangguhkan" ? "Konfirmasi Ditangguhkan" : "Konfirmasi Ditolak"}
              </button>
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
                setData((prev) =>
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
                  value={editModalItem.kegiatan}
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, kegiatan: e.target.value })
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  required
                />
              </div>

              {/* Kategori & Tingkatan */}
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
                    {KATEGORI_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                    {editModalItem.kategori === "Pendanaan" ? "Sumber *" : "Tingkatan *"}
                  </label>
                  <select
                    value={editModalItem.tingkatan}
                    onChange={(e) =>
                      setEditModalItem({ ...editModalItem, tingkatan: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                  >
                    {getTingkatanOptions(editModalItem.kategori).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
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
                        {PRESTASI_LOMBA_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                      Jenis Penyelenggara
                    </label>
                    <select
                      value={editModalItem.jenisPenyelenggara || "Belmawa"}
                      onChange={(e) =>
                        setEditModalItem({ ...editModalItem, jenisPenyelenggara: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Belmawa">Belmawa</option>
                      <option value="Non-Belmawa">Non-Belmawa</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
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
                        {getJabatanOptions(editModalItem.kategori).map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {editModalItem.kategori === "Publikasi" && (
                    <div className="space-y-1.5 mt-3">
                      <label className="text-xs font-bold text-gray-700 dark:text-slate-300 block">
                        Jenis Publikasi
                      </label>
                      <select
                        value={editModalItem.jenisPublikasi || "Ilmiah"}
                        onChange={(e) =>
                          setEditModalItem({ ...editModalItem, jenisPublikasi: e.target.value })
                        }
                        className="w-full p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Ilmiah">Ilmiah</option>
                        <option value="Populer">Populer</option>
                      </select>
                    </div>
                  )}
                </>
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
                  value={editModalItem.tautanSertifikat || ""}
                  placeholder="https://..."
                  onChange={(e) =>
                    setEditModalItem({ ...editModalItem, tautanSertifikat: e.target.value })
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
    </div>
  );
}