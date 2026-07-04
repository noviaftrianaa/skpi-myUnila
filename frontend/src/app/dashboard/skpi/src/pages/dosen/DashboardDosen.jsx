// src/pages/dosen/DashboardDosen.jsx

import { useState, useEffect } from "react";
import SidebarDosen from "../../components/common/SidebarDosen";
import {
  Search,
  Eye,
  Award,
  Users,
  CheckCircle2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  GraduationCap,
  MapPin,
  FileText
} from "lucide-react";

// ============================================================================
// DATA MAHASISWA & KEGIATAN SIMULASI (SEED DATA)
// ============================================================================
const DEFAULT_BIMBINGAN = [
  {
    id: 101,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "National Hackathon 2025",
    date: "2025-10-15",
    location: "Institut Teknologi Bandung",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Ditangguhkan",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 102,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "International Robotics Competition 2025",
    date: "2025-11-05",
    location: "Singapore Exhibition Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Menunggu",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 103,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    title: "National Game Dev Contest",
    date: "2025-10-20",
    location: "Universitas Indonesia",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 20,
    certificate: "/Sertifikat.png",
  },
  {
    id: 104,
    nama: "Siti Nurhaliza",
    npm: "202110002",
    programStudi: "Manajemen Informatika",
    title: "Regional Line Follower Competition",
    date: "2025-10-25",
    location: "Universitas Lampung",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Peserta",
    pembimbing: "Prof. Dr. Ir. Suharno, M.S.",
    status: "Menunggu",
    statusColor: "text-[#B45309] bg-[#FEF9C3]",
    dot: "bg-[#F59E0B]",
    poin: null,
    certificate: null,
  },
  {
    id: 105,
    nama: "Eko Prasetyo",
    npm: "202110005",
    programStudi: "Sistem Informasi",
    title: "Competitive Programming Unila",
    date: "2025-10-10",
    location: "FMIPA Unila",
    kategori: "Lomba",
    tingkatan: "Jurusan",
    jabatan: "Peserta",
    pembimbing: "Dr. Ryan Randy Suryono",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 5,
    certificate: null,
  },
  {
    id: 106,
    nama: "Dewi Lestari",
    npm: "202110004",
    programStudi: "Teknik Informatika",
    title: "National Smart City Competition",
    date: "2025-09-18",
    location: "Institut Teknologi Sepuluh Nopember",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Anggota",
    pembimbing: "Ahmad Zakaria, Ph.D.",
    status: "Ditolak",
    statusColor: "text-[#DC2626] bg-[#FEE2E2]",
    dot: "bg-[#DC2626]",
    poin: null,
    certificate: null,
  },
  {
    id: 107,
    nama: "Ahmad Rizki",
    npm: "202110001",
    programStudi: "Teknik Informatika",
    title: "International Web Design Competition",
    date: "2025-11-12",
    location: "Online",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 25,
    certificate: null,
  },
  {
    id: 108,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    title: "National Business Plan Competition",
    date: "2025-08-15",
    location: "Universitas Gadjah Mada",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Ketua",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 20,
    certificate: null,
  },
  {
    id: 109,
    nama: "Hanifa Sophia",
    npm: "2020021001",
    programStudi: "Teknik Elektro",
    title: "International IoT Challenge",
    date: "2025-07-20",
    location: "Kuala Lumpur Convention Centre",
    kategori: "Lomba",
    tingkatan: "Internasional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 25,
    certificate: null,
  },
  {
    id: 110,
    nama: "Dai Hakiki",
    npm: "202110011",
    programStudi: "Teknik Informatika",
    title: "National Cyber Security CTF",
    date: "2025-09-05",
    location: "Universitas Brawijaya",
    kategori: "Lomba",
    tingkatan: "Nasional",
    jabatan: "Anggota",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 15,
    certificate: null,
  },
  {
    id: 111,
    nama: "Novia Fitriana",
    npm: "202110010",
    programStudi: "Teknik Elektro",
    title: "Regional UI/UX Design Competition",
    date: "2025-06-12",
    location: "Universitas Padjadjaran",
    kategori: "Lomba",
    tingkatan: "Regional",
    jabatan: "Peserta",
    pembimbing: "Dr. Eng. Admi Syarif",
    status: "Divalidasi",
    statusColor: "text-[#16A34A] bg-[#DCFCE7]",
    dot: "bg-[#16A34A]",
    poin: 10,
    certificate: null,
  }
];

const LIST_DOSEN = [
  "Dr. Eng. Admi Syarif",
  "Prof. Dr. Ir. Suharno, M.S.",
  "Ahmad Zakaria, Ph.D.",
  "Dr. Ryan Randy Suryono"
];

// ============================================================================
// MODAL DETAIL PRESTASI (BIMBINGAN DETAIL)
// ============================================================================
function DetailBimbinganModal({ student, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeActivity, setActiveActivity] = useState(student.kegiatanList[0]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        
        {/* SISI KIRI: DATA DETAIL */}
        <div className="flex-1 p-8 overflow-y-auto border-r border-[#E5E7EB]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[11px] font-bold tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase">
                Detail Prestasi Bimbingan
              </span>
              <h2 className="text-2xl font-bold text-[#0F172A] mt-2 font-poppins">
                {student.nama}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 md:hidden bg-gray-100 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profil Mahasiswa */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] mb-6">
            <h3 className="text-sm font-semibold text-[#374151] mb-3 uppercase tracking-wide font-poppins flex items-center gap-2">
              <GraduationCap size={16} className="text-[#1D4ED8]" />
              Profil Mahasiswa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-[#94A3B8] text-xs font-medium font-poppins">NPM</p>
                <p className="font-semibold text-[#0F172A] font-poppins">{student.npm}</p>
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs font-medium font-poppins">Program Studi</p>
                <p className="font-semibold text-[#0F172A] font-poppins">{student.programStudi}</p>
              </div>
            </div>
          </div>

          {/* Detail Aktivitas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#374151] uppercase tracking-wide font-poppins flex items-center gap-2 border-b pb-2">
              <Award size={16} className="text-[#1D4ED8]" />
              Daftar Kegiatan Lomba
            </h3>
            
            <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Judul Lomba</th>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Tingkat</th>
                    <th className="p-3 font-semibold text-xs text-[#64748B]">Poin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {student.kegiatanList.map(keg => (
                    <tr 
                      key={keg.id} 
                      onClick={() => setActiveActivity(keg)}
                      className={`cursor-pointer hover:bg-blue-50 transition-colors ${activeActivity.id === keg.id ? 'bg-blue-50 border-l-2 border-blue-600' : ''}`}
                    >
                      <td className="p-3 font-medium text-[#0F172A] max-w-[200px] truncate">{keg.title}</td>
                      <td className="p-3 text-xs">{keg.tingkatan}</td>
                      <td className="p-3 font-semibold">{keg.poin || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Detail Ekstra untuk Kegiatan Aktif */}
          <div className="mt-6 bg-[#F1F5F9] rounded-2xl p-4 border border-[#E2E8F0]">
            <h4 className="text-xs font-bold text-[#475569] uppercase mb-2 font-poppins">
              Info Lengkap: {activeActivity.title}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#64748B] text-xs">Peran / Jabatan</p>
                <p className="font-medium text-[#0F172A]">{activeActivity.jabatan}</p>
              </div>
              <div>
                <p className="text-[#64748B] text-xs">Tanggal</p>
                <p className="font-medium text-[#0F172A]">{activeActivity.date}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[#64748B] text-xs">Lokasi</p>
                <p className="font-medium text-[#0F172A] flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  {activeActivity.location || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN: PREVIEW DOKUMEN / SERTIFIKAT */}
        <div className="flex-1 p-8 bg-[#F8FAFC] flex flex-col justify-between max-h-screen">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] font-poppins flex items-center gap-2">
              <FileText size={16} className="text-blue-700" />
              Lampiran Sertifikat ({activeActivity.title})
            </h3>
            
            {/* Desktop Close */}
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#0F172A] hidden md:block bg-white border p-2 rounded-xl hover:shadow-sm transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Pratinjau Toolbar */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-[#E2E8F0] shadow-sm mb-4 flex-wrap">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1D4ED8]"
            >
              <ZoomOut size={14} /> Perkecil
            </button>
            <span className="text-xs text-[#94A3B8] font-semibold">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => z + 0.1)}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1D4ED8]"
            >
              <ZoomIn size={14} /> Perbesar
            </button>
            <button
              onClick={() => setRotation((r) => r + 90)}
              className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#1D4ED8]"
            >
              <RotateCw size={14} /> Putar
            </button>
            <div className="flex-1" />
            <button
              disabled={!activeActivity.certificate}
              onClick={() => {
                if (activeActivity.certificate) {
                  const link = document.createElement("a");
                  link.href = activeActivity.certificate;
                  link.download = `sertifikat_${student.nama}_${activeActivity.title}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }
              }}
              className="flex items-center gap-1 text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-semibold"
            >
              <Download size={13} /> Unduh
            </button>
          </div>

          {/* Dokumen Viewer */}
          <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-center overflow-hidden min-h-[300px] max-h-[500px]">
            <div className="flex-1 w-full h-full p-4 overflow-y-auto flex flex-col items-center gap-6">
              {activeActivity.certificate ? (
                <div className="flex flex-col items-center gap-2 w-full">
                  <p className="text-sm font-semibold text-gray-600">Sertifikat</p>
                {activeActivity.certificate.startsWith("data:application/pdf") ? (
                  <iframe src={activeActivity.certificate} style={{ width: "100%", height: "400px", transform: `scale(${zoom})`, transformOrigin: "top center" }} className="shadow-sm border border-gray-200" />
                ) : (
                  <img
                    src={activeActivity.certificate}
                    alt={`Sertifikat ${activeActivity.title}`}
                    className="transition-transform duration-300 shadow-sm border border-gray-200"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      maxWidth: "100%",
                      objectFit: "contain"
                    }}
                  />
                )}
                </div>
              ) : (
                <div className="text-center p-6 w-full flex flex-col items-center justify-center min-h-[200px]">
                  <div className="w-16 h-16 bg-[#EEF4FF] rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-700">
                    <Award size={32} />
                  </div>
                  <p className="text-gray-400 text-sm font-poppins">
                    Sertifikat tidak diunggah dalam bentuk berkas.
                  </p>
                </div>
              )}
              {activeActivity.kategori === "Lomba" && activeActivity.skFile && (
                <div className="flex flex-col items-center gap-2 w-full mt-4">
                  <p className="text-sm font-semibold text-gray-600">SK Pembimbing</p>
                  {activeActivity.skFile.startsWith("data:application/pdf") ? (
                    <iframe src={activeActivity.skFile} style={{ width: "100%", height: "400px", transform: `scale(${zoom})`, transformOrigin: "top center" }} className="shadow-sm border border-gray-200" />
                  ) : (
                    <img
                      src={activeActivity.skFile}
                      alt={`SK Pembimbing ${activeActivity.title}`}
                      className="transition-transform duration-300 shadow-sm border border-gray-200"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                        maxWidth: "100%",
                        objectFit: "contain"
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function DashboardDosen() {
  // Nama dosen aktif — dalam produksi akan berasal dari session/auth context.
  // Sementara menggunakan data pertama sebagai default simulasi.
  const currentLecturer = LIST_DOSEN[0];

  const [bimbinganList, setBimbinganList] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBimbingan, setSelectedBimbingan] = useState(null);

  // Load data dari localStorage & seed
  useEffect(() => {
    // Tarik data kegiatan mahasiswa dari localStorage
    const stored = localStorage.getItem("skpi_kegiatan");
    let allData = [];
    if (stored) {
      try {
        allData = JSON.parse(stored).map(item => ({
          ...item,
          nama: item.nama || "Hanifa",
          npm: item.npm || "2020029999",
          programStudi: item.programStudi || "Ilmu Komputer",
        }));
      } catch {
        allData = [];
      }
    }

    // Gabungkan dengan data bawaan default (hindari duplikasi)
    const merged = [...allData];
    DEFAULT_BIMBINGAN.forEach((defItem) => {
      if (!merged.some((m) => m.id === defItem.id || (m.title === defItem.title && m.pembimbing === defItem.pembimbing))) {
        merged.push({
          ...defItem,
          nama: defItem.nama || "Hanifa",
          npm: defItem.npm || "2020021001",
          programStudi: defItem.programStudi || "Teknik Elektro",
        });
      }
    });

    // Saring: hanya kegiatan Lomba milik dosen aktif yang SUDAH DIVALIDASI oleh admin
    const filtered = merged.filter(
      (item) => item.pembimbing === currentLecturer && item.kategori === "Lomba" && item.status === "Divalidasi"
    );

    setBimbinganList(filtered);
  }, [currentLecturer]);

  // Filter Data
  const groupedBimbinganMap = bimbinganList.reduce((acc, item) => {
    const query = (search || "").toLowerCase();
    const match = 
      (item.nama || "").toLowerCase().includes(query) ||
      (item.npm || "").toLowerCase().includes(query) ||
      (item.title || "").toLowerCase().includes(query);

    if (match) {
      if (!acc[item.npm]) {
        acc[item.npm] = {
          nama: item.nama,
          npm: item.npm,
          programStudi: item.programStudi,
          kegiatanList: [],
          totalPoin: 0,
        };
      }
      acc[item.npm].kegiatanList.push(item);
      acc[item.npm].totalPoin += (item.poin || 0);
    }
    return acc;
  }, {});

  const groupedBimbinganList = Object.values(groupedBimbinganMap);

  // Hitung stats — dosen hanya melihat yang sudah divalidasi
  const totalMahasiswa = groupedBimbinganList.length;
  const totalKegiatan = groupedBimbinganList.reduce((sum, m) => sum + m.kegiatanList.length, 0);

  const statCards = [
    {
      label: "Total Mahasiswa",
      value: totalMahasiswa,
      icon: <Users size={20} />,
      iconBg: "linear-gradient(180deg, #1E3A8A 0%, #0EA5E9 100%)",
      iconColor: "#FFFFFF",
    },
    {
      label: "Total Kegiatan Divalidasi",
      value: totalKegiatan,
      icon: <CheckCircle2 size={20} />,
      iconBg: "linear-gradient(180deg, #22C55E 0%, #10B981 100%)",
      iconColor: "#FFFFFF",
    },
  ];

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <SidebarDosen />

      {/* DETAIL MODAL OVERLAY */}
      {selectedBimbingan && (
        <DetailBimbinganModal
          student={selectedBimbingan}
          onClose={() => setSelectedBimbingan(null)}
        />
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="font-poppins font-bold text-[26px] leading-[38px] text-[#0F172A]">
            Daftar Mahasiswa Bimbingan Lomba
          </h1>
          <p className="mt-1 font-poppins font-normal text-[15px] leading-[22px] text-[#94A3B8]">
            Lihat pratinjau data kegiatan prestasi mahasiswa yang anda bimbing dalam kegiatan perlombaan
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {statCards.map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-[#F1F5F9] flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <p className="font-poppins font-semibold text-[13px] text-[#64748B] tracking-wide uppercase">
                  {card.label}
                </p>
                <p className="font-poppins font-extrabold text-[32px] text-[#0F172A] mt-1.5">
                  {card.value}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          
          {/* SEARCH BAR */}
          <div className="p-6 border-b border-[#F1F5F9] flex flex-col md:flex-row gap-4 justify-between items-center bg-[#FCFDFE]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#374151] font-poppins">
              <Search size={16} className="text-[#1D4ED8]" />
              Cari Mahasiswa Bimbingan
            </div>
            
            <div className="relative w-full md:w-96">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, NPM, atau lomba..."
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#1D4ED8] transition-colors font-poppins text-[#0F172A]"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-poppins border-b border-[#F1F5F9]">
                  <th className="py-4 px-6 text-center w-12">No</th>
                  <th className="py-4 px-6">Mahasiswa</th>
                  <th className="py-4 px-6">Program Studi</th>
                  <th className="py-4 px-6 text-center">Jumlah Kegiatan</th>
                  <th className="py-4 px-6 text-center">Total Poin</th>
                  <th className="py-4 px-6 text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {groupedBimbinganList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-[#94A3B8] font-poppins text-sm bg-white">
                      Belum ada mahasiswa bimbingan lomba yang sudah divalidasi.
                    </td>
                  </tr>
                ) : (
                  groupedBimbinganList.map((student, idx) => (
                    <tr key={student.npm} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 text-center text-xs font-semibold text-gray-500 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-[#0F172A] font-poppins">
                            {student.nama}
                          </span>
                          <span className="text-[13px] text-[#94A3B8] font-mono mt-0.5 mb-1">
                            {student.npm}
                          </span>
                          <span className="text-[13px] font-medium text-[#60A5FA]">
                            {student.kegiatanList.length} kegiatan
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-sm text-gray-800 font-poppins">
                          {student.programStudi}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-poppins">
                          {student.kegiatanList.length} Lomba
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-poppins font-bold text-sm text-[#0F172A]">
                          {student.totalPoin || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedBimbingan(student)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-[0.98] font-poppins"
                        >
                          <Eye size={14} />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          <div className="p-6 border-t border-[#F1F5F9] flex justify-between items-center text-xs text-[#94A3B8] font-poppins bg-[#FCFDFE]">
            <div>
              Menampilkan {groupedBimbinganList.length} mahasiswa bimbingan.
            </div>
            <div className="font-semibold text-gray-500">
              Sistem Validasi SKPI Universitas Lampung
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
